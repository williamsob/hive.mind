function splitDate(dateString){
    return dateString.split('T').join(',').split('-').join(',').split('/').join(',').split(":").join(',').split(' ').join(',').split(',');
}

function inputInThePast(input){
    const now = new Date();
    const timeNow = splitDate(`${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

    return String(splitDate(input)) < String(timeNow);
}   
document.forms['meeting-form'].addEventListener('submit', () => {
    const dateInput = document.getElementById('meeting-date-input');
    
    if (inputInThePast(dateInput.value)){
        return alert('Date cannot be in the past.');
    }

})