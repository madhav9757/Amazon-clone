export let products = [] ;

export function loadProducts (fun) {

  const get = new XMLHttpRequest() ;

  get.addEventListener('load' , () => {

    products = JSON.parse(get.response) ;

    fun()
  })
  get.open('GET' , 'https://supersimplebackend.dev/products')
  get.send() ;
}
