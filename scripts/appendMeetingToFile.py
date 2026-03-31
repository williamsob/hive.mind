from browser import document


document.attach("hello, i'm python code running in the browser.")
document.bind("click",lambda event: print(event))