export const CACHE_KEYS = {
  paymentMethods: () => 'payment-methods:active',
  paymentMethodByName: (name) => `payment-method:${name.toLowerCase()}`,
  userProfile: (uid) => `user:${uid}`,
  siteSettings: () => 'site:settings',
  gameSettings: () => 'game:settings',
};

export const CACHE_TTL = {
  paymentMethods: 300,    // ৫ মিনিট
  userProfile: 60,        // ১ মিনিট
  siteSettings: 600,      // ১০ মিনিট
  gameSettings: 600,      // ১০ মিনিট
};