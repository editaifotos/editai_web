export const healthService = {
  async check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
};

