export function addProperty(dataArray, propertyName, propertyValue) {
  dataArray.map((doc) => {
    doc[propertyName] = propertyValue;
  });
  return dataArray;
}
export const sortJson = (json) => {
  if (!json) return {};

  if (typeof json !== 'object') return {};

  return Object.entries(json)
    .sort((a, b) => +(a > b) || -(b > a))
    .reduce((o, [k, v]) => ((o[k] = v), o), {});
};

export const prettyJson = (json) => {
  return JSON.stringify(json, null, 6).replace(/\n( *)/g, function (match, p1) {
    return '<br>' + '&nbsp;'.repeat(p1.length);
  });
};
export const sortJsonArray = (arrJson, propertyToSortBy) => {
  arrJson.sort(function (a, b) {
    return a[propertyToSortBy] - b[propertyToSortBy];
  });
};
export const sortJsonObjectOfProperties = (o) => {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});
};
