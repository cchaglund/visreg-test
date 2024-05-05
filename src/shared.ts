import { ConfigurationSettings, NonOverridableSettings, VisregOptions } from './types';

const visregConfig: ConfigurationSettings = process.env.CYPRESS_VISREG_SETTINGS
	? JSON.parse(process.env.CYPRESS_VISREG_SETTINGS)
	: {};

const snapshotSettings: VisregOptions = process.env.CYPRESS_SNAPSHOT_SETTINGS
	? JSON.parse(process.env.CYPRESS_SNAPSHOT_SETTINGS)
	: {};

const nonOverridableSettings: NonOverridableSettings = process.env.CYPRESS_NON_OVERRIDABLE_SETTINGS
	? JSON.parse(process.env.CYPRESS_NON_OVERRIDABLE_SETTINGS)
	: {};

export const maxViewportWidth = visregConfig?.maxViewport?.width || 1920;
export const maxViewportHeight = visregConfig?.maxViewport?.height || 1080;
export const timeouts = snapshotSettings?.timeouts || {};
export const suitesDirectory = nonOverridableSettings?.suitesDirectory || '';