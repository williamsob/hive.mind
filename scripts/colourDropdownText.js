const dropdowns = Array.from(document.getElementsByTagName('select'));

dropdowns.forEach( (dropdown) => {

    dropdown.addEventListener('change', (event) => {
        const optionSelected = dropdown.selectedOptions;

        if (optionSelected.length > 0) {
            dropdown.style.color = 'black';
        } 
        
        else {
            dropdown.style.color = 'grey';
        }

    })
}); 
