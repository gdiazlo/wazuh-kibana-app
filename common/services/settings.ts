import { EpluginSettingType, PLUGIN_SETTINGS, TpluginSetting, TPluginSettingWithKey } from '../constants';

/**
 * Get the default value of the plugin setting
 * @param setting setting key
 * @returns setting default value
 */
export function getSettingDefaultValue(setting: string) {
	return typeof PLUGIN_SETTINGS[setting].defaultHidden !== 'undefined'
		? PLUGIN_SETTINGS[setting].defaultHidden
		: PLUGIN_SETTINGS[setting].default;
};

export function getSettingsDefault() {
	return Object.entries(PLUGIN_SETTINGS).reduce((accum, [pluginSettingID, pluginSettingConfiguration]) => ({
		...accum,
		[pluginSettingID]: pluginSettingConfiguration.default
	}), {});
};

export function getSettingsByCategories() {
	return Object.entries(PLUGIN_SETTINGS).reduce((accum, [pluginSettingID, pluginSettingConfiguration]) => ({
		...accum,
		[pluginSettingConfiguration.category]: [...(accum[pluginSettingConfiguration.category] || []), { ...pluginSettingConfiguration, key: pluginSettingID }]
	}), {});
};

export function getSettingsDefaultList() {
	return Object.entries(PLUGIN_SETTINGS).reduce((accum, [pluginSettingID, pluginSettingConfiguration]) => ([
		...accum,
		{ ...pluginSettingConfiguration, key: pluginSettingID }
	]), []);
};

/**
 * 
 * @param pluginSetting Plugin setting definition
 * @param fromValue value of the form
 * @returns Transform the form value to the type of the setting expected
 */
 export function formatSettingValueFromForm(pluginSettingKey: string, formValue: any) {
	const { type } = PLUGIN_SETTINGS[pluginSettingKey];
	return formatSettingValueFromFormType[type](formValue);
};

const formatSettingValueFromFormType = {
	[EpluginSettingType.text]: (value: string): string => value,
	[EpluginSettingType.textarea]: (value: string): string => value,
	[EpluginSettingType.number]: (value: string): number => Number(value),
	[EpluginSettingType.switch]: (value: string): boolean => Boolean(value),
	[EpluginSettingType.editor]: (value: any): any => value, // Array form transforms the value. It is coming a valid JSON.
	[EpluginSettingType.select]: (value: any): any => value,
};

/**
 * Format the plugin setting value received in the backend to store in the plugin configuration file (.yml).
 * @param value plugin setting value sent to the endpoint
 * @returns valid value to .yml
 */
export function formatSettingValueToFile(value: any) {
	const formatter = formatSettingValueToFileType[typeof value] || formatSettingValueToFileType.default;
	return formatter(value);
};

const formatSettingValueToFileType = {
	string: (value: string): string => `"${value.replace(/"/,'\\"').replace(/\n/g,'\\n')}"`, // Escape the " character and new line
	object: (value: any): string => JSON.stringify(value),
	default: (value: any): any => value
};

/**
 * Group the settings by category
 * @param settings 
 * @returns 
 */
export function groupSettingsByCategory(settings: TPluginSettingWithKey[]){
	const settingsSortedByCategories = settings.reduce((accum, pluginSettingConfiguration) => ({
		...accum,
		[pluginSettingConfiguration.category]: [
		...(accum[pluginSettingConfiguration.category] || []),
		{...pluginSettingConfiguration}
		]
	}),{});

	return Object.entries(settingsSortedByCategories)
		.map(([category, settings]) => ({ category, settings }))
		.filter(categoryEntry => categoryEntry.settings.length);
};

/**
 * Get the plugin setting description composed.
 * @param options 
 * @returns 
 */
 export function getPluginSettingDescription({description, options}: TpluginSetting): string{
	return [
		description,
		...(options?.select ? [`Allowed values: ${options.select.map(({text, value}) => formatLabelValuePair(text, value)).join(', ')}.`] : []),
		...(options?.switch ? [`Allowed values: ${['enabled', 'disabled'].map(s => formatLabelValuePair(options.switch.values[s].label, options.switch.values[s].value)).join(', ')}.`] : []),
	].join(' ');
};

/**
 * Format the pair value-label to display the pair. If label and the string of value are equals, only displays the value, if not, displays both.
 * @param value 
 * @param label 
 * @returns 
 */
function formatLabelValuePair(label, value){
	return label !== `${value}`
		? `${value} (${label})`
		: `${value}`
};
