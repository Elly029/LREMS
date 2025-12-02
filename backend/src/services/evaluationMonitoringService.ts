import EvaluationMonitoringModel, { IEvaluator } from '@/models/EvaluationMonitoring';
import BookModel from '@/models/Book';
import { NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';
import { IUser } from '@/models/User';
import cache from '@/utils/cache';

export class EvaluationMonitoringService {
  // Check if user is admin (has full access)
  private isAdmin(user: IUser): boolean {
    const username = (user?.username || '').toLowerCase();
    if (username === 'jc' || username === 'nonie') return false;
    return Boolean(user?.is_admin_access);
  }

  // Validate user access
  private validateAccess(user: IUser, learningArea: string): boolean {
    if (!user || !user.access_rules || user.access_rules.length === 0) {
      if (!user) return true;
      return false;
    }

    for (const rule of user.access_rules) {
      const allowedScienceUsers = ['leo', 'jc', 'nonie', 'test-user'];
      const username = (user.username || '').toLowerCase();
      const areaMatchRaw = rule.learning_areas.includes('*') || rule.learning_areas.includes(learningArea);
      const areaMatch = learningArea === 'Science' ? areaMatchRaw && allowedScienceUsers.includes(username) : areaMatchRaw;
      if (areaMatch) return true;
    }
    return false;
  }

  // Get all monitoring entries
  async getAll(user?: IUser) {
    try {
      let filter: any = {};

      // Area overrides for specific users
      const areaOverrides: { [key: string]: string[] } = {
        celso: ['Mathematics', 'Math', 'EPP', 'TLE'],
        mak: ['English', 'Reading & Literacy', 'Reading and Literacy'],
        rhod: ['Values Education', 'GMRC'],
        ven: ['GMRC'],
        micah: ['AP', 'Araling Panlipunan', 'Makabansa', 'MAKABANSA'],
        leo: ['Science'],
        rejoice: ['Language', 'Filipino'],
      };
      const gradeOverrides: { [key: string]: number[] } = {
        jc: [1, 3],
        nonie: [1, 3],
      };

      const username = (user?.username || '').toLowerCase();
      const overrideAreas = areaOverrides[username];
      const gradeLimit = gradeOverrides[username];

      // Access control
      if (user && !this.isAdmin(user)) {
        const allowedScienceUsers = ['leo', 'jc', 'nonie', 'test-user'];

        // If user has area overrides, use those
        if (overrideAreas && overrideAreas.length > 0) {
          filter.learning_area = { $in: overrideAreas };
        } else if (user.access_rules && user.access_rules.length > 0) {
          // Use access_rules if no overrides
          const learningAreas: string[] = [];
          user.access_rules.forEach(rule => {
            if (rule.learning_areas.includes('*')) {
              // Wildcard - don't filter by area unless Science restriction applies
              if (!allowedScienceUsers.includes(username)) {
                // Will be handled by $nin below
              }
              return;
            }
            const areas = rule.learning_areas.filter(a => a !== 'Science' || allowedScienceUsers.includes(username));
            learningAreas.push(...areas);
          });

          if (learningAreas.length > 0) {
            filter.learning_area = { $in: learningAreas };
          } else if (!allowedScienceUsers.includes(username)) {
            // Has wildcard but not allowed Science
            filter.learning_area = { $nin: ['Science'] };
          }
        } else {
          // No access_rules and no overrides - only show created items
          filter.created_by = user.username;
        }

        // Apply grade restrictions
        if (gradeLimit && gradeLimit.length > 0) {
          filter.grade_level = { $in: gradeLimit };
        }
      }

      let monitoringEntries = await EvaluationMonitoringModel.find(filter)
        .sort({ created_at: -1 })
        .lean();

      // If user is an evaluator (has evaluator_id), filter by evaluator assignment
      // This happens after DB query to handle both string IDs and populated objects
      if (user && (user as any).evaluator_id && !(user as any).is_admin_access) {
        const evaluatorId = (user as any).evaluator_id;
        monitoringEntries = monitoringEntries.filter(entry => {
          return entry.evaluators && entry.evaluators.some((e: any) =>
            (typeof e === 'string' && e === evaluatorId) ||
            (typeof e === 'object' && e._id && e._id.toString() === evaluatorId.toString())
          );
        });
      }

      return monitoringEntries.map(entry => ({
        ...entry,
        bookCode: entry.book_code,
        learningArea: entry.learning_area,
        eventName: entry.event_name,
        eventDate: entry.event_date,
      }));
    } catch (error) {
      logger.error('Error fetching monitoring entries', error);
      throw error;
    }
  }

  // Get monitoring entry by book code
  async getByBookCode(bookCode: string, user?: IUser) {
    try {
      const entry = await EvaluationMonitoringModel.findOne({ book_code: bookCode }).lean();

      if (!entry) {
        throw new NotFoundError(`Monitoring entry for book ${bookCode} not found`);
      }

      // Check access
      if (user && !this.isAdmin(user) && !this.validateAccess(user, entry.learning_area)) {
        if (entry.learning_area === 'Science') {
          logger.warn(`Unauthorized Science monitoring view attempt by ${user.username}`);
        }
        throw new ForbiddenError('You do not have permission to view this monitoring entry');
      }

      return {
        ...entry,
        bookCode: entry.book_code,
        learningArea: entry.learning_area,
        eventName: entry.event_name,
        eventDate: entry.event_date,
      };
    } catch (error) {
      logger.error(`Error fetching monitoring entry ${bookCode}`, error);
      throw error;
    }
  }

  // Create monitoring entry
  async create(data: {
    bookCode: string;
    learningArea: string;
    evaluators?: IEvaluator[];
    eventName?: string;
    eventDate?: string;
  }, user?: IUser) {
    try {
      // Verify book exists
      const book = await BookModel.findOne({ book_code: data.bookCode });
      if (!book) {
        throw new NotFoundError(`Book with code ${data.bookCode} not found`);
      }

      // Check access
      if (user && !this.isAdmin(user) && !this.validateAccess(user, data.learningArea)) {
        throw new ForbiddenError('You do not have permission to create monitoring entries for this learning area');
      }

      // Check if already exists
      const existing = await EvaluationMonitoringModel.findOne({ book_code: data.bookCode });
      if (existing) {
        throw new ForbiddenError(`Monitoring entry for book ${data.bookCode} already exists`);
      }

      const entry = await EvaluationMonitoringModel.create({
        book_code: data.bookCode,
        learning_area: data.learningArea,
        evaluators: data.evaluators || [],
        event_name: data.eventName,
        event_date: data.eventDate,
        created_by: user?.username || 'system',
      });

      logger.info(`Monitoring entry created for book ${data.bookCode} by ${user?.username || 'system'}`);
      cache.invalidateNamespace('monitoring:list');

      return {
        ...entry.toObject(),
        bookCode: entry.book_code,
        learningArea: entry.learning_area,
        eventName: entry.event_name,
        eventDate: entry.event_date,
      };
    } catch (error) {
      logger.error('Error creating monitoring entry', error);
      throw error;
    }
  }

  // Update monitoring entry
  async update(bookCode: string, data: {
    bookCode?: string;
    learningArea?: string;
    evaluators?: IEvaluator[];
    eventName?: string;
    eventDate?: string;
  }, user?: IUser) {
    try {
      const entry = await EvaluationMonitoringModel.findOne({ book_code: bookCode });

      if (!entry) {
        throw new NotFoundError(`Monitoring entry for book ${bookCode} not found`);
      }

      // Check access
      if (user && !this.isAdmin(user) && !this.validateAccess(user, entry.learning_area)) {
        throw new ForbiddenError('You do not have permission to update this monitoring entry');
      }

      const updateFields: any = {};

      if (data.bookCode && data.bookCode !== bookCode) {
        // Verify new book exists
        const book = await BookModel.findOne({ book_code: data.bookCode });
        if (!book) {
          throw new NotFoundError(`Book with code ${data.bookCode} not found`);
        }

        // Check if new book code already has monitoring
        const existingMonitoring = await EvaluationMonitoringModel.findOne({ book_code: data.bookCode });
        if (existingMonitoring) {
          throw new ForbiddenError(`Monitoring entry for book ${data.bookCode} already exists`);
        }

        updateFields.book_code = data.bookCode;
      }

      if (data.learningArea !== undefined) updateFields.learning_area = data.learningArea;
      if (data.evaluators !== undefined) updateFields.evaluators = data.evaluators;
      if (data.eventName !== undefined) updateFields.event_name = data.eventName;
      if (data.eventDate !== undefined) updateFields.event_date = data.eventDate;
      updateFields.updated_by = user?.username || 'system';

      await EvaluationMonitoringModel.updateOne({ book_code: bookCode }, updateFields);

      logger.info(`Monitoring entry updated for book ${bookCode} by ${user?.username || 'system'}`);
      cache.invalidateNamespace('monitoring:list');

      const updatedEntry = await EvaluationMonitoringModel.findOne({
        book_code: data.bookCode || bookCode
      }).lean();

      return {
        ...updatedEntry,
        bookCode: updatedEntry!.book_code,
        learningArea: updatedEntry!.learning_area,
        eventName: updatedEntry!.event_name,
        eventDate: updatedEntry!.event_date,
      };
    } catch (error) {
      logger.error(`Error updating monitoring entry ${bookCode}`, error);
      throw error;
    }
  }

  // Delete monitoring entry
  async delete(bookCode: string, user?: IUser) {
    try {
      const entry = await EvaluationMonitoringModel.findOne({ book_code: bookCode });

      if (!entry) {
        throw new NotFoundError(`Monitoring entry for book ${bookCode} not found`);
      }

      // Check access
      if (user && !this.isAdmin(user) && !this.validateAccess(user, entry.learning_area)) {
        throw new ForbiddenError('You do not have permission to delete this monitoring entry');
      }

      await EvaluationMonitoringModel.deleteOne({ book_code: bookCode });

      logger.info(`Monitoring entry deleted for book ${bookCode} by ${user?.username || 'system'}`);
      cache.invalidateNamespace('monitoring:list');
    } catch (error) {
      logger.error(`Error deleting monitoring entry ${bookCode}`, error);
      throw error;
    }
  }

  // Bulk create monitoring entries
  async bulkCreate(entries: Array<{
    bookCode: string;
    learningArea: string;
    evaluators?: IEvaluator[];
    eventName?: string;
    eventDate?: string;
  }>, user?: IUser) {
    try {
      const results = [];
      const errors = [];

      for (const entryData of entries) {
        try {
          const entry = await this.create(entryData, user);
          results.push(entry);
        } catch (error: any) {
          errors.push({
            bookCode: entryData.bookCode,
            error: error.message,
          });
        }
      }

      return { results, errors };
    } catch (error) {
      logger.error('Error bulk creating monitoring entries', error);
      throw error;
    }
  }
}

export default new EvaluationMonitoringService();
