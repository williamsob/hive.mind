document.addEventListener('click', (event) => {
console.log('\n');
    if (window.innerWidth < 480) {
    console.log('Mobile view');
}

    if (window.innerWidth >= 480 && window.innerWidth < 768) {
        console.log('Tablet view');
    }

    if (window.innerWidth >= 768) {
        console.log('Desktop view');
    }

    console.log(window.innerWidth + 'x' + window.innerHeight);
});

console.log('Script loaded');
