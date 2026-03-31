export function splitDate(dateString){
    return dateString.split('T').join(',').split('-').join(',').split('/').join(',').split(":").join(',').split(' ').join(',').split(',');
};

export default function inputInThePast(input){
    const now = new Date();
    const timeNow = splitDate(`${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

    return String(splitDate(input)) < String(timeNow);
}   
