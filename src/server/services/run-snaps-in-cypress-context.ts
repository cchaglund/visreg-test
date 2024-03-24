const mockCypress = {
    Commands: {
        add: () => { },
    },
};

(globalThis as any).Cypress = mockCypress;

(async () => {
    const path = process.env.SUITE_CONFIG_DIR;
    const fileType = process.env.FILE_TYPE;
    const fullPath = `${path}/snaps.${fileType}`;
    await import(fullPath);
})()