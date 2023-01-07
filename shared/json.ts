export function addProperty(dataArray, propertyName, propertyValue){
    dataArray.map(doc => {
        doc[propertyName] = propertyValue;
    });
    return dataArray;
}