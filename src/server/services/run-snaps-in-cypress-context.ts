const mockCypress = {
    Commands: {
        add: () => { },
    },
};

(globalThis as any).Cypress = mockCypress;

(async () => {
    await import(process.env.FILE_PATH || '');
})()