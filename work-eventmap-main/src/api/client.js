import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.');
}

export const supabase = createClient(url || 'http://localhost', anonKey || 'missing-key');

const PHOTO_BUCKET = 'facility-photos';

const withStatus = (error, status) => Object.assign(new Error(error?.message || 'Request failed'), { status });

// Same call shape the pages already use, backed by Supabase.
function entity(table) {
  return {
    async filter(query = {}, { sort, limit } = {}) {
      let q = supabase.from(table).select('*');
      for (const [k, v] of Object.entries(query)) q = q.eq(k, v);
      if (sort) {
        const desc = sort.startsWith('-');
        q = q.order(desc ? sort.slice(1) : sort, { ascending: !desc });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw withStatus(error, 400);
      return data;
    },
    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw withStatus(error, 403);
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
      if (error) throw withStatus(error, 403);
      if (!data?.length) throw withStatus({ message: 'Not allowed or not found' }, 403);
      return data[0];
    },
    async delete(id) {
      const { data, error } = await supabase.from(table).delete().eq('id', id).select();
      if (error) throw withStatus(error, 403);
      if (!data?.length) throw withStatus({ message: 'Not allowed or not found' }, 403);
    },
  };
}

const toPath = (target) => {
  try {
    const u = new URL(target, window.location.origin);
    return u.pathname + u.search;
  } catch {
    return '/';
  }
};

export const api = {
  entities: {
    Facility: entity('facilities'),
    Activity: entity('activities'),
  },

  auth: {
    async me() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw withStatus({ message: 'Not authenticated' }, 401);
      const { user } = session;
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).maybeSingle();
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: profile?.role ?? 'user',
      };
    },
    async hasSession() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    onChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        // Defer: calling Supabase inside this callback can deadlock.
        setTimeout(() => callback(event), 0);
      });
      return () => data.subscription.unsubscribe();
    },
    async loginViaEmailPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw withStatus(error, 401);
    },
    loginWithProvider(provider, returnTo = '/') {
      return supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + returnTo },
      });
    },
    async register({ email, password }) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw withStatus(error, 400);
    },
    async verifyOtp({ email, otpCode }) {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw withStatus(error, 400);
      return data;
    },
    async resendOtp(email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw withStatus(error, 400);
    },
    async resetPasswordRequest(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw withStatus(error, 400);
    },
    async resetPassword({ newPassword }) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw withStatus(error, 400);
    },
    async logout(redirectUrl) {
      await supabase.auth.signOut();
      if (redirectUrl) window.location.href = '/';
    },
    redirectToLogin(returnUrl = window.location.href) {
      window.location.href = '/login?returnTo=' + encodeURIComponent(toPath(returnUrl));
    },
  },

  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
          contentType: file.type,
          cacheControl: '31536000',
        });
        if (error) throw withStatus(error, 403);
        const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
        return { file_url: data.publicUrl };
      },
    },
  },
};
