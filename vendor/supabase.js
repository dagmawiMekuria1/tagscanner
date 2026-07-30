const SUPABASE_URL = 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = 'placeholder-anon-key';

class SupabaseQueryBuilder {
  constructor(table) {
    this._table = table;
    this._filters = [];
    this._orderCol = null;
    this._orderAsc = true;
    this._limitVal = null;
    this._singleVal = false;
    this._maybeSingleVal = false;
    this._selectCols = '*';
  }

  select(cols) {
    this._selectCols = cols || '*';
    return this;
  }

  eq(col, val) {
    this._filters.push({ type: 'eq', col, val });
    return this;
  }

  neq(col, val) {
    this._filters.push({ type: 'neq', col, val });
    return this;
  }

  gt(col, val) {
    this._filters.push({ type: 'gt', col, val });
    return this;
  }

  gte(col, val) {
    this._filters.push({ type: 'gte', col, val });
    return this;
  }

  lt(col, val) {
    this._filters.push({ type: 'lt', col, val });
    return this;
  }

  lte(col, val) {
    this._filters.push({ type: 'lte', col, val });
    return this;
  }

  ilike(col, val) {
    this._filters.push({ type: 'ilike', col, val });
    return this;
  }

  in(col, val) {
    this._filters.push({ type: 'in', col, val });
    return this;
  }

  order(col, opts) {
    this._orderCol = col;
    this._orderAsc = opts && opts.ascending !== undefined ? opts.ascending : true;
    return this;
  }

  limit(val) {
    this._limitVal = val;
    return this;
  }

  single() {
    this._singleVal = true;
    return this;
  }

  maybeSingle() {
    this._maybeSingleVal = true;
    return this;
  }

  async then(resolve, reject) {
    try {
      const result = { data: [], error: null, count: 0 };
      resolve(result);
    } catch (e) {
      if (reject) reject(e);
    }
  }

  insert(data) {
    return new SupabaseQueryBuilder(this._table);
  }

  update(data) {
    return new SupabaseQueryBuilder(this._table);
  }

  delete() {
    return new SupabaseQueryBuilder(this._table);
  }

  upsert(data) {
    return new SupabaseQueryBuilder(this._table);
  }
}

class SupabaseStorageBuilder {
  constructor(bucket) {
    this._bucket = bucket;
  }

  upload(path, file) {
    return Promise.resolve({ data: { path: path }, error: null });
  }

  getPublicUrl(path) {
    return { data: { publicUrl: 'https://placeholder.supabase.co/storage/v1/object/public/' + this._bucket + '/' + path } };
  }

  remove(paths) {
    return Promise.resolve({ data: paths, error: null });
  }

  list(folder, opts) {
    return Promise.resolve({ data: [], error: null });
  }
}

class SupabaseStorage {
  from(bucket) {
    return new SupabaseStorageBuilder(bucket);
  }
}

class SupabaseAuth {
  constructor() {
    this._user = null;
    this._session = null;
    this._listeners = [];
  }

  async getSession() {
    return { data: { session: this._session }, error: null };
  }

  async getUser() {
    return { data: { user: this._user }, error: null };
  }

  async signUp(credentials) {
    return { data: { user: null, session: null }, error: null };
  }

  async signInWithPassword(credentials) {
    return { data: { user: null, session: null }, error: null };
  }

  async signInWithOAuth(opts) {
    return { data: { url: '#' }, error: null };
  }

  async signOut() {
    this._user = null;
    this._session = null;
    return { error: null };
  }

  async resetPasswordForEmail(email) {
    return { data: {}, error: null };
  }

  onAuthStateChange(callback) {
    this._listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this._listeners = this._listeners.filter(function(l) { return l !== callback; });
          }
        }
      }
    };
  }
}

class SupabaseClient {
  constructor(url, key) {
    this.supabaseUrl = url;
    this.supabaseKey = key;
    this.auth = new SupabaseAuth();
    this.storage = new SupabaseStorage();
  }

  from(table) {
    return new SupabaseQueryBuilder(table);
  }

  rpc(fn, params) {
    return Promise.resolve({ data: null, error: null });
  }
}

export function createClient(url, key) {
  return new SupabaseClient(url || SUPABASE_URL, key || SUPABASE_ANON_KEY);
}

export { SupabaseClient };
export default { createClient };