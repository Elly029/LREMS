import BookService from '@/services/bookService'
import BookModel from '@/models/Book'

describe('RBAC Area Assignments', () => {
  jest.setTimeout(30000)
  beforeAll(async () => {
    await BookModel.deleteMany({})
    await BookModel.create({ book_code: 'MATH-1', learning_area: 'Mathematics', grade_level: 1, publisher: 'P', title: 'Math', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'EPP-3', learning_area: 'EPP', grade_level: 3, publisher: 'P', title: 'EPP', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'TLE-5', learning_area: 'TLE', grade_level: 5, publisher: 'P', title: 'TLE', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'ENG-2', learning_area: 'English', grade_level: 2, publisher: 'P', title: 'English', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'READ-2', learning_area: 'Reading & Literacy', grade_level: 2, publisher: 'P', title: 'Reading', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'GMRC-4', learning_area: 'GMRC', grade_level: 4, publisher: 'P', title: 'GMRC', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'VALUES-6', learning_area: 'Values Education', grade_level: 6, publisher: 'P', title: 'Values', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'AP-1', learning_area: 'AP', grade_level: 1, publisher: 'P', title: 'AP', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'MAK-3', learning_area: 'Makabansa', grade_level: 3, publisher: 'P', title: 'Makabansa', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'SCI-3', learning_area: 'Science', grade_level: 3, publisher: 'P', title: 'Science', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'FIL-2', learning_area: 'Filipino', grade_level: 2, publisher: 'P', title: 'Fil', status: 'In Progress', created_by: 'seed' })
    await BookModel.create({ book_code: 'LANG-2', learning_area: 'Language', grade_level: 2, publisher: 'P', title: 'Lang', status: 'In Progress', created_by: 'seed' })
  })

  afterAll(async () => {
    await BookModel.deleteMany({})
  })

  it('celso sees Math/EPP/TLE only', async () => {
    const user = { username: 'celso', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['EPP','Mathematics','TLE'].sort())
  })

  it('mak sees English and Reading & Literacy', async () => {
    const user = { username: 'mak', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['English','Reading & Literacy'].sort())
  })

  it('rhod sees Values Education and GMRC', async () => {
    const user = { username: 'rhod', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['GMRC','Values Education'].sort())
  })

  it('ven sees GMRC only', async () => {
    const user = { username: 'ven', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['GMRC'].sort())
  })

  it('micah sees AP and Makabansa', async () => {
    const user = { username: 'micah', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['AP','Makabansa'].sort())
  })

  it('leo sees Science only', async () => {
    const user = { username: 'leo', access_rules: [{ learning_areas: ['Science'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['Science'].sort())
  })

  it('rejoice sees Language and Filipino', async () => {
    const user = { username: 'rejoice', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const areas = new Set(res.data.map((b: any) => b.learningArea))
    expect([...areas].sort()).toEqual(['Filipino','Language'].sort())
  })

  it('jc sees all areas but only grades 1 and 3', async () => {
    const user = { username: 'jc', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: true } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const grades = new Set(res.data.map((b: any) => b.gradeLevel))
    expect([...grades].sort()).toEqual([1,3])
  })

  it('nonie sees all areas but only grades 1 and 3', async () => {
    const user = { username: 'nonie', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: true } as any
    const res = await BookService.getBooks({ page: 1, limit: 50 }, user)
    const grades = new Set(res.data.map((b: any) => b.gradeLevel))
    expect([...grades].sort()).toEqual([1,3])
  })
})
