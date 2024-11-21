export function addBook(form){
    // console.log(form, "ytir")
    
    let employees = JSON.parse(localStorage.getItem("form"))
    // console.log(employees, "dfge")

    employees.push(form)
    localStorage.setItem("form",JSON.stringify(form))
    console.log(employees)
  }