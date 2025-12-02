import BookModel from '@/models/Book';
import RemarkModel from '@/models/Remark';
import { Book, CreateBookRequest, UpdateBookRequest, BooksQueryParams } from '@/types';
import { NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
import logger from '@/utils/logger';
import { IUser } from '@/models/User';
import cache from '@/utils/cache';
import config from '@/config/environment';

export class BookService {
  // Map camelCase to snake_case for database fields
  private mapSortField(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'bookCode': 'book_code',
      'learningArea': 'learning_area',
      'gradeLevel': 'grade_level',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
    };
    return fieldMap[field] || field;
  }

  // Generate unique book code
  private generateBookCode(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${timestamp}${random}`;
  }

  // Check if user is admin (has full access)
  private isAdmin(user: IUser): boolean {
    const username = (user?.username || '').toLowerCase();
    if (username === 'jc' || username === 'nonie') return false;
    return user?.role === 'Administrator' || Boolean(user?.is_admin_access);
  }

  // Validate user access
  private validateAccess(user: IUser, learningArea: string, gradeLevel: number): boolean {
    if (!user || !user.access_rules || user.access_rules.length === 0) {
      if (!user) return true;
      return false;
    }

    const allowedScienceUsers = ['leo', 'jc', 'nonie', 'test-user'];
    const limitedGradesUsers: { [key: string]: number[] } = { jc: [1, 3], nonie: [1, 3] };
    const username = (user.username || '').toLowerCase();

    for (const rule of user.access_rules) {
      const areaMatchRaw = rule.learning_areas.includes('*') || rule.learning_areas.includes(learningArea);
      const areaMatch = learningArea === 'Science' ? areaMatchRaw && allowedScienceUsers.includes(username) : areaMatchRaw;

      const limitedGrades = limitedGradesUsers[username];
      const gradeMatchRaw = !rule.grade_levels || rule.grade_levels.length === 0 || rule.grade_levels.includes(gradeLevel);
      const gradeMatch = limitedGrades ? limitedGrades.includes(gradeLevel) : gradeMatchRaw;

      if (areaMatch && gradeMatch) return true;
    }
    return false;
  }

  // Get all books with filtering, search, and pagination
  async getBooks(queryParams: BooksQueryParams, user?: IUser) {
    try {
      if (config.features.enableCache) {
        const cached = cache.get('books:list', { q: queryParams, u: user?.username });
        if (cached) {
          return cached;
        }
      }
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search,
        status,
        learningArea,
        gradeLevel,
        publisher,
        hasRemarks,
        adminView
      } = queryParams;

      const mappedSortBy = this.mapSortField(sortBy);
      const skip = (page - 1) * limit;
      const cursor = (queryParams as any).cursor as string | undefined;

      // Build filter query
      const filter: any = {};

      const usernameLower = (user?.username || '').toLowerCase();
      const allowedScienceUsersView = ['leo', 'test-user'];

      // Grade overrides for specific users (JC and Nonie only see grades 1 and 3)
      const gradeOverrides: { [key: string]: number[] } = {
        jc: [1, 3],
        nonie: [1, 3],
      };

      const requestedAreas = learningArea ? (Array.isArray(learningArea) ? learningArea : [learningArea]) : [];
      if (requestedAreas.includes('Science') && user && !this.isAdmin(user) && !allowedScienceUsersView.includes(usernameLower)) {
        logger.warn(`Unauthorized Science data view attempt by ${user.username}`);
      }

      // Search conditions
      let searchConditions: any[] = [];
      if (search) {
        searchConditions = [
          { learning_area: { $regex: search, $options: 'i' } },
          { publisher: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
        ];
      }

      // Access control conditions
      let accessConditions: any[] = [];
      if (user && user.access_rules && user.access_rules.length > 0) {
        const isSuperAdmin = this.isAdmin(user);
        const isAdminView = adminView === true || String(adminView) === 'true';
        const canBypassRestrictions = isSuperAdmin || (isAdminView && (user.role === 'Administrator' || user.is_admin_access));

        if (!canBypassRestrictions) {
          const allowedScienceUsers = ['leo', 'jc', 'nonie', 'test-user'];
          const limitGradesForUsers: { [key: string]: number[] } = { jc: [1, 3], nonie: [1, 3] };
          const username = (user.username || '').toLowerCase();

          const ruleConditions = user.access_rules.map(rule => {
            const condition: any = {};

            if (!rule.learning_areas.includes('*')) {
              let areas = [...rule.learning_areas];
              if (!allowedScienceUsers.includes(username)) {
                areas = areas.filter(a => a !== 'Science');
              }
              if (areas.length > 0) {
                condition.learning_area = { $in: areas };
              } else {
                condition.learning_area = { $in: [] };
              }
            }

            if (limitGradesForUsers[username]) {
              condition.grade_level = { $in: limitGradesForUsers[username] };
            } else if (rule.grade_levels && rule.grade_levels.length > 0) {
              condition.grade_level = { $in: rule.grade_levels };
            }

            return condition;
          });

          // Build the created_by condition
          const createdByCondition: any = { created_by: user.username };
          if (limitGradesForUsers[username]) {
            createdByCondition.grade_level = { $in: limitGradesForUsers[username] };
          }

          accessConditions = [
            { $or: ruleConditions },
            createdByCondition
          ];
        }
      }

      if (user && (!user.access_rules || user.access_rules.length === 0)) {
        const isAdminView = adminView === true || String(adminView) === 'true';
        if (!isAdminView || !(user.role === 'Administrator' || user.is_admin_access)) {
          const gradeLimit = gradeOverrides[usernameLower];

          // No access rules - only show their own created items
          const base: any = { created_by: user.username };
          if (gradeLimit && gradeLimit.length > 0) {
            base.grade_level = { $in: gradeLimit };
          }
          accessConditions = [base];
        }
      }

      // Combine search and access conditions
      if (searchConditions.length > 0 && accessConditions.length > 0) {
        filter.$and = [
          { $or: searchConditions },
          { $or: accessConditions }
        ];
      } else if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      } else if (accessConditions.length > 0) {
        filter.$or = accessConditions;
      }

      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        filter.status = { $in: statusArray };
      }

      if (learningArea) {
        let areasArray = Array.isArray(learningArea) ? learningArea : [learningArea];
        if (user && !this.isAdmin(user) && !allowedScienceUsersView.includes(usernameLower)) {
          areasArray = areasArray.filter(a => a !== 'Science');
        }
        filter.learning_area = { $in: areasArray };
      }

      if (gradeLevel) {
        let gradesArray = Array.isArray(gradeLevel) ? gradeLevel.map(Number) : [Number(gradeLevel)];
        const gradeLimit = gradeOverrides[usernameLower];
        if (gradeLimit && gradeLimit.length > 0) {
          gradesArray = gradesArray.filter(g => gradeLimit.includes(g));
        }
        filter.grade_level = { $in: gradesArray };
      }

      if (publisher) {
        const publishersArray = Array.isArray(publisher) ? publisher : [publisher];
        filter.publisher = { $in: publishersArray };
      }

      // Build sort object
      const sort: any = {};
      sort[mappedSortBy] = sortOrder === 'asc' ? 1 : -1;

      const pipeline: any[] = [];

      if (cursor) {
        const mongoose = (await import('mongoose')).default;
        const objectId = new mongoose.Types.ObjectId(cursor);
        const cursorMatch = sortOrder === 'asc' ? { _id: { $gt: objectId } } : { _id: { $lt: objectId } };
        pipeline.push({ $match: cursorMatch });
      }

      pipeline.push({ $match: filter });

      pipeline.push({
        $lookup: {
          from: 'remarks',
          'let': { bookCode: '$book_code' },
          pipeline: [
            { $match: { $expr: { $eq: ['$book_code', '$$bookCode'] } } },
            { $sort: { timestamp: -1 } }
          ],
          as: 'remarks',
        }
      });

      pipeline.push({
        $addFields: {
          remarks_count: { $size: '$remarks' },
        }
      });

      if (hasRemarks !== undefined) {
        pipeline.push({ $match: { remarks_count: hasRemarks ? { $gt: 0 } : 0 } });
      }

      pipeline.push({
        $project: {
          _id: 1,
          book_code: 1,
          learning_area: 1,
          grade_level: 1,
          publisher: 1,
          title: 1,
          status: 1,
          is_new: 1,
          ntp_date: 1,
          created_at: 1,
          updated_at: 1,
          remarks: 1,
          remarks_count: 1,
        }
      });

      pipeline.push({ $sort: sort });
      if (!cursor) {
        pipeline.push({ $skip: skip });
      }
      pipeline.push({ $limit: limit });

      const booksAggregation = await BookModel.aggregate(pipeline);

      const totalItems = await BookModel.countDocuments(filter);
      const filterOptions = await this.getFilterOptions();

      const mappedData = booksAggregation.map(book => ({
        ...book,
        bookCode: book.book_code,
        learningArea: book.learning_area,
        gradeLevel: book.grade_level,
        isNew: book.is_new,
        ntpDate: book.ntp_date,
        createdAt: book.created_at,
        updatedAt: book.updated_at,
        // Map remark _id to id for frontend compatibility
        remarks: book.remarks ? book.remarks.map((remark: any) => ({
          ...remark,
          id: remark._id.toString(),
        })) : [],
      }));

      const result = {
        data: mappedData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit,
          hasNext: cursor ? mappedData.length === limit : page * limit < totalItems,
          hasPrev: cursor ? Boolean(cursor) : page > 1,
        },
        filters: filterOptions,
      };

      if (config.features.enableCache) {
        cache.set('books:list', { q: queryParams, u: user?.username }, result, (config.cache.defaultTtlSeconds || 120) * 1000);
      }

      return result;
    } catch (error) {
      logger.error('Error fetching books', error);
      throw error;
    }
  }

  async getBookByCode(bookCode: string): Promise<Book> {
    try {
      const book = await BookModel.findOne({ book_code: bookCode }).lean();
      if (!book) {
        throw new NotFoundError(`Book with code ${bookCode} not found`);
      }

      const remarks = await RemarkModel.find({ book_code: bookCode })
        .sort({ from_date: 1, timestamp: 1 })
        .lean();

      // Map _id to id for frontend compatibility
      const mappedRemarks = remarks.map(remark => ({
        ...remark,
        id: remark._id.toString(),
      }));

      return {
        ...book,
        remarks: mappedRemarks || [],
      } as any;
    } catch (error) {
      logger.error(`Error fetching book ${bookCode}`, error);
      throw error;
    }
  }

  async createBook(bookData: CreateBookRequest, user?: IUser): Promise<Book> {
    try {
      if (user && !this.validateAccess(user, bookData.learningArea, bookData.gradeLevel)) {
        logger.warn(`Unauthorized create attempt by user ${user.username} for area ${bookData.learningArea}`);
        throw new ForbiddenError('You do not have permission to create books in this learning area or grade level.');
      }

      let bookCode = bookData.bookCode;

      if (bookCode) {
        // Check if provided bookCode already exists
        const existingBook = await BookModel.findOne({ book_code: bookCode });
        if (existingBook) {
          throw new ForbiddenError(`Book code ${bookCode} already exists.`);
        }
      } else {
        bookCode = this.generateBookCode();
      }

      const book = await BookModel.create({
        book_code: bookCode,
        learning_area: bookData.learningArea,
        grade_level: bookData.gradeLevel,
        publisher: bookData.publisher,
        title: bookData.title,
        status: bookData.status,
        is_new: bookData.isNew !== false,
        ntp_date: bookData.ntpDate ? new Date(bookData.ntpDate) : undefined,
        created_by: user?.username || 'system',
      });

      if (bookData.remark) {
        await RemarkModel.create({
          book_code: bookCode,
          text: bookData.remark,
          timestamp: new Date(),
          created_by: user?.name || 'System',
        });
      }

      logger.info(`Book created successfully: ${bookCode} by ${user?.username || 'system'}`);
      cache.invalidateNamespace('books:list');
      return await this.getBookByCode(bookCode!);
    } catch (error) {
      logger.error('Error creating book', error);
      throw error;
    }
  }

  async updateBook(bookCode: string, updateData: UpdateBookRequest, user?: IUser): Promise<Book> {
    try {
      const existingBook = await BookModel.findOne({ book_code: bookCode });
      if (!existingBook) {
        throw new NotFoundError(`Book with code ${bookCode} not found`);
      }

      const isCreator = user?.username === existingBook.created_by;
      const hasAccess = this.validateAccess(user!, existingBook.learning_area, existingBook.grade_level);
      const admin = this.isAdmin(user!);

      if (user && !(isCreator || admin || hasAccess)) {
        logger.warn(`Unauthorized update attempt by user ${user.username} for book ${bookCode}`);
        throw new ForbiddenError('You do not have permission to update this book.');
      }

      if (user && !admin) {
        const newArea = updateData.learningArea || existingBook.learning_area;
        const newGrade = updateData.gradeLevel !== undefined ? updateData.gradeLevel : existingBook.grade_level;

        if (!this.validateAccess(user, newArea, newGrade) && !isCreator) {
          throw new ForbiddenError('You do not have permission to move this book to the specified learning area or grade level.');
        }
      }

      const updateFields: any = {};
      if (updateData.learningArea !== undefined) updateFields.learning_area = updateData.learningArea;
      if (updateData.gradeLevel !== undefined) updateFields.grade_level = updateData.gradeLevel;
      if (updateData.publisher !== undefined) updateFields.publisher = updateData.publisher;
      if (updateData.title !== undefined) updateFields.title = updateData.title;
      if (updateData.status !== undefined) updateFields.status = updateData.status;
      if (updateData.isNew !== undefined) updateFields.is_new = updateData.isNew;
      if (updateData.ntpDate !== undefined) updateFields.ntp_date = updateData.ntpDate ? new Date(updateData.ntpDate) : null;

      // Handle bookCode update
      let newBookCode = bookCode;
      if (updateData.bookCode && updateData.bookCode !== bookCode) {
        const codeExists = await BookModel.findOne({ book_code: updateData.bookCode });
        if (codeExists) {
          throw new ForbiddenError(`Book code ${updateData.bookCode} already exists.`);
        }
        updateFields.book_code = updateData.bookCode;
        newBookCode = updateData.bookCode;
      }

      if (Object.keys(updateFields).length > 0) {
        const statusChanged = updateFields.status !== undefined && updateFields.status !== existingBook.status;

        logger.info(`Attempting to update book ${bookCode} with fields:`, updateFields);
        await BookModel.updateOne({ book_code: bookCode }, updateFields);
        logger.info(`Database update completed for ${bookCode}`);

        // If bookCode changed, update remarks
        if (newBookCode !== bookCode) {
          await RemarkModel.updateMany({ book_code: bookCode }, { book_code: newBookCode });
        }
      }

      if (updateData.remark) {
        await RemarkModel.create({
          book_code: newBookCode,
          text: updateData.remark,
          timestamp: new Date(),
          created_by: user?.name || 'System',
        });
      }

      logger.info(`Book updated successfully: ${bookCode} -> ${newBookCode}`);
      if (updateFields.status !== undefined) {
        logger.info(`Status changed: ${existingBook.status} -> ${updateFields.status} for ${newBookCode}`);
      }
      cache.invalidateNamespace('books:list');
      return await this.getBookByCode(newBookCode);
    } catch (error) {
      logger.error(`Error updating book ${bookCode}`, error);
      throw error;
    }
  }

  async deleteBook(bookCode: string, user?: IUser): Promise<void> {
    try {
      const book = await BookModel.findOne({ book_code: bookCode });
      if (!book) {
        throw new NotFoundError(`Book with code ${bookCode} not found`);
      }

      const isCreator = user?.username === book.created_by;
      const hasAccess = this.validateAccess(user!, book.learning_area, book.grade_level);
      const admin = this.isAdmin(user!);

      if (user && !(isCreator || admin || hasAccess)) {
        logger.warn(`Unauthorized delete attempt by user ${user.username} for book ${bookCode}`);
        throw new ForbiddenError('You do not have permission to delete this book.');
      }

      await BookModel.deleteOne({ book_code: bookCode });
      await RemarkModel.deleteMany({ book_code: bookCode });

      logger.info(`Book deleted successfully: ${bookCode}`);
      cache.invalidateNamespace('books:list');
    } catch (error) {
      logger.error(`Error deleting book ${bookCode}`, error);
      throw error;
    }
  }

  async addRemark(
    bookCode: string,
    remarkData: {
      text: string;
      timestamp?: string;
      from?: string;
      to?: string;
      from_date?: string;
      to_date?: string;
      status?: string;
      days_delay_deped?: number;
      days_delay_publisher?: number;
    },
    user?: IUser
  ): Promise<any> {
    try {
      const book = await BookModel.findOne({ book_code: bookCode });
      if (!book) {
        throw new NotFoundError(`Book with code ${bookCode} not found`);
      }

      const isCreator = user?.username === book.created_by;
      const hasAccess = this.validateAccess(user!, book.learning_area, book.grade_level);
      const admin = this.isAdmin(user!);

      if (user && !(isCreator || admin || hasAccess)) {
        logger.warn(`Unauthorized add remark attempt by user ${user.username} for book ${bookCode}`);
        throw new ForbiddenError('You do not have permission to add remarks to this book.');
      }

      const remark = await RemarkModel.create({
        book_code: bookCode,
        text: remarkData.text,
        timestamp: remarkData.timestamp ? new Date(remarkData.timestamp) : new Date(),
        created_by: user?.name || 'System',
        from: remarkData.from,
        to: remarkData.to,
        from_date: remarkData.from_date ? new Date(remarkData.from_date) : undefined,
        to_date: remarkData.to_date ? new Date(remarkData.to_date) : undefined,
        status: remarkData.status,
        days_delay_deped: remarkData.days_delay_deped,
        days_delay_publisher: remarkData.days_delay_publisher,
      });

      logger.info(`Remark added to book ${bookCode}`);
      cache.invalidateNamespace('books:list');
      return remark;
    } catch (error) {
      logger.error(`Error adding remark to book ${bookCode}`, error);
      throw error;
    }
  }

  async updateRemark(
    bookCode: string,
    remarkId: string,
    remarkData: {
      text?: string;
      timestamp?: string;
      from?: string;
      to?: string;
      from_date?: string;
      to_date?: string;
      status?: string;
      days_delay_deped?: number;
      days_delay_publisher?: number;
    },
    user?: IUser
  ): Promise<any> {
    try {
      const book = await BookModel.findOne({ book_code: bookCode });
      if (!book) {
        throw new NotFoundError(`Book with code ${bookCode} not found`);
      }

      const remark = await RemarkModel.findById(remarkId);
      if (!remark) {
        throw new NotFoundError(`Remark with ID ${remarkId} not found`);
      }

      if (remark.book_code !== bookCode) {
        throw new ForbiddenError('Remark does not belong to this book');
      }

      const isCreator = user?.username === book.created_by;
      const hasAccess = this.validateAccess(user!, book.learning_area, book.grade_level);
      const admin = this.isAdmin(user!);

      if (user && !(isCreator || admin || hasAccess)) {
        logger.warn(`Unauthorized update remark attempt by user ${user.username} for book ${bookCode}`);
        throw new ForbiddenError('You do not have permission to update remarks on this book.');
      }

      const updateFields: any = {};
      if (remarkData.text !== undefined) updateFields.text = remarkData.text;
      if (remarkData.timestamp !== undefined) updateFields.timestamp = new Date(remarkData.timestamp);
      if (remarkData.from !== undefined) updateFields.from = remarkData.from;
      if (remarkData.to !== undefined) updateFields.to = remarkData.to;
      if (remarkData.from_date !== undefined) updateFields.from_date = remarkData.from_date ? new Date(remarkData.from_date) : null;
      if (remarkData.to_date !== undefined) updateFields.to_date = remarkData.to_date ? new Date(remarkData.to_date) : null;
      if (remarkData.status !== undefined) updateFields.status = remarkData.status;
      if (remarkData.days_delay_deped !== undefined) updateFields.days_delay_deped = remarkData.days_delay_deped;
      if (remarkData.days_delay_publisher !== undefined) updateFields.days_delay_publisher = remarkData.days_delay_publisher;

      const updatedRemark = await RemarkModel.findByIdAndUpdate(remarkId, updateFields, { new: true });

      logger.info(`Remark ${remarkId} updated for book ${bookCode}`);
      cache.invalidateNamespace('books:list');
      return updatedRemark;
    } catch (error) {
      logger.error(`Error updating remark ${remarkId} for book ${bookCode}`, error);
      throw error;
    }
  }

  async deleteRemark(bookCode: string, remarkId: string, user?: IUser): Promise<void> {
    try {
      const book = await BookModel.findOne({ book_code: bookCode });
      if (!book) {
        throw new NotFoundError(`Book with code ${bookCode} not found`);
      }

      const mongoose = (await import('mongoose')).default;
      if (!mongoose.Types.ObjectId.isValid(remarkId)) {
        throw new (await import('@/middleware/errorHandler')).ValidationError('Invalid remarkId format');
      }

      const remark = await RemarkModel.findById(remarkId);
      if (!remark) {
        throw new NotFoundError(`Remark with ID ${remarkId} not found`);
      }

      if (remark.book_code !== bookCode) {
        throw new ForbiddenError('Remark does not belong to this book');
      }

      const isCreator = user?.username === book.created_by;
      const hasAccess = this.validateAccess(user!, book.learning_area, book.grade_level);
      const admin = this.isAdmin(user!);

      if (user && !(isCreator || admin || hasAccess)) {
        logger.warn(`Unauthorized delete remark attempt by user ${user.username} for book ${bookCode}`);
        throw new ForbiddenError('You do not have permission to delete remarks on this book.');
      }

      await RemarkModel.findByIdAndDelete(remarkId);
      logger.info(`Remark ${remarkId} deleted from book ${bookCode}`);
      cache.invalidateNamespace('books:list');
    } catch (error) {
      logger.error(`Error deleting remark ${remarkId} from book ${bookCode}`, error);
      throw error;
    }
  }

  async getFilterOptions() {
    try {
      const statuses = await BookModel.distinct('status');
      const learningAreas = await BookModel.distinct('learning_area');
      const gradeLevels = await BookModel.distinct('grade_level');
      const publishers = await BookModel.distinct('publisher');

      return {
        availableStatuses: statuses,
        availableLearningAreas: learningAreas,
        gradeLevels: gradeLevels.sort((a, b) => a - b),
        availablePublishers: publishers,
      };
    } catch (error) {
      logger.error('Error fetching filter options', error);
      throw error;
    }
  }
}

export default new BookService();
