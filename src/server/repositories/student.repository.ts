export interface StudentRepository {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export const studentRepository: StudentRepository = {
  async findAll() { return []; },
  async findById(id) { return null; },
  async create(data) { return data; },
  async update(id, data) { return data; },
  async delete(id) {},
};
