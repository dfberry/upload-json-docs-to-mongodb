export function addProperty(dataArray, propertyName, propertyValue) {
  dataArray.map((doc) => {
    doc[propertyName] = propertyValue;
  });
  return dataArray;
}
export const sortJson = (json) => {
  if (!json) return {};

  if (typeof json !== 'object') return {};

  // @ts-ignore
  return Object.entries(json).sort(Intl.Collator().compare)
    .reduce((o, [k, v]) => ((o[k] = v), o), {});
};

export const prettyJson = (json) => {
  return JSON.stringify(json, null, 6).replace(/\n( *)/g, function (match, p1) {
    return '<br>' + '&nbsp;'.repeat(p1.length);
  });
};
