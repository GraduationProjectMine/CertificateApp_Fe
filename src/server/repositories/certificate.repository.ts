export const certificateRepository = {
  async findAll() { return []; },
  async findById(id: string) { return null; },
  async create(data: any) { return data; },
  async update(id: string, data: any) { return data; },
};
