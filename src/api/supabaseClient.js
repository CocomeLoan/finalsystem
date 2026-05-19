import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aitsnadsajzuzrinmavk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdHNuYWRzYWp6dXpyaW5tYXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTY2MDAsImV4cCI6MjA5NDQ3MjYwMH0.82uJ_uGzveWmto-m-ZMW0lfkVYIZHEhUYKx4_-UZogE';

const client = createClient(supabaseUrl, supabaseAnonKey);

// Compatibility layer for base44 entity API
const createEntity = (tableName) => ({
  list: async (sort) => {
    let query = client.from(tableName).select('*');
    if (sort) {
      if (sort.startsWith('-')) {
        query = query.order(sort.substring(1), { ascending: false });
      } else {
        query = query.order(sort, { ascending: true });
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  filter: async (filters) => {
    let query = client.from(tableName).select('*');
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  get: async (id) => {
    const { data, error } = await client.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (record) => {
    const { data, error } = await client.from(tableName).insert(record).select().single();
    if (error) throw error;
    return data;
  },
  bulkCreate: async (records) => {
    const { data, error } = await client.from(tableName).insert(records).select();
    if (error) throw error;
    return data;
  },
  update: async (id, updates) => {
    const { data, error } = await client.from(tableName).update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await client.from(tableName).delete().eq('id', id);
    if (error) throw error;
  }
});

export const supabase = {
  ...client,
  entities: {
    Student: createEntity('students'),
    Concern: createEntity('concerns'),
    Prediction: createEntity('predictions'),
    SubjectGrade: createEntity('subject_grades'),
    TrainingLog: createEntity('training_logs')
  }
};

export default supabase;
