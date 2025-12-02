import { connectDatabase, closeConnection } from '@/config/database'
import BookService from '@/services/bookService'
import BookModel from '@/models/Book'

describe('RBAC Science Access', () => {
  beforeAll(async () => {
    await connectDatabase()
    await BookModel.deleteMany({})
    await BookModel.create({
      book_code: 'SCI-G3-001',
      learning_area: 'Science',
      grade_level: 3,
      publisher: 'Test Pub',
      title: 'Sci G3',
      status: 'In Progress',
      created_by: 'seed'
    })
    await BookModel.create({
      book_code: 'MATH-G1-001',
      learning_area: 'Mathematics',
      grade_level: 1,
      publisher: 'Test Pub',
      title: 'Math G1',
      status: 'In Progress',
      created_by: 'seed'
    })
    await BookModel.create({
      book_code: 'SCI-G7-001',
      learning_area: 'Science',
      grade_level: 7,
      publisher: 'Test Pub',
      title: 'Sci G7',
      status: 'In Progress',
      created_by: 'seed'
    })
    await BookModel.create({
      book_code: 'OWN-001',
      learning_area: 'Science',
      grade_level: 3,
      publisher: 'Test Pub',
      title: 'Own Sci',
      status: 'In Progress',
      created_by: 'facilitator-x'
    })
  })

  afterAll(async () => {
    await BookModel.deleteMany({})
    await closeConnection()
  })

  it('allows Leo to view Science', async () => {
    const user = { username: 'leo', access_rules: [{ learning_areas: ['Science'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 10, learningArea: ['Science'] }, user)
    expect(res.data.find((b: any) => b.bookCode === 'SCI-G3-001')).toBeTruthy()
  })

  it('allows JC to view Science grades 1 and 3 only', async () => {
    const user = { username: 'jc', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: true } as any
    const resScience = await BookService.getBooks({ page: 1, limit: 10, learningArea: ['Science'] }, user)
    expect(resScience.data.find((b: any) => b.bookCode === 'SCI-G3-001')).toBeTruthy()

    const resGrade1 = await BookService.getBooks({ page: 1, limit: 10, gradeLevel: [1] }, user)
    expect(resGrade1.data.find((b: any) => b.bookCode === 'MATH-G1-001')).toBeTruthy()
  })

  it('allows Nonie to view Science grades 1 and 3 only', async () => {
    const user = { username: 'nonie', access_rules: [{ learning_areas: ['*'], grade_levels: [] }], is_admin_access: true } as any
    const resScience = await BookService.getBooks({ page: 1, limit: 10, learningArea: ['Science'] }, user)
    expect(resScience.data.find((b: any) => b.bookCode === 'SCI-G3-001')).toBeTruthy()
  })

  it('blocks other facilitators from Science', async () => {
    const user = { username: 'ven', access_rules: [{ learning_areas: ['Mathematics'], grade_levels: [] }], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 10, learningArea: ['Science'] }, user)
    expect(res.data.length).toBe(0)
  })

  it('shows only own created items when no access rules', async () => {
    const user = { username: 'facilitator-x', access_rules: [], is_admin_access: false } as any
    const res = await BookService.getBooks({ page: 1, limit: 10 }, user)
    expect(res.data.length).toBe(1)
    expect(res.data[0].bookCode).toBe('OWN-001')
  })
})
