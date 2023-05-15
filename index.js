const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  // calculate start and end page numbers based on current page and numPages
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(currentPage + 2, numPages);

  // if there are less than 5 pages, adjust the start and end page numbers accordingly
  if (numPages <= 5) {
    startPage = 1;
    endPage = numPages;
  } else if (currentPage <= 2) {
    endPage = 5;
  } else if (currentPage >= numPages - 1) {
    startPage = numPages - 4;
  }

  // add buttons for each page
  for (let i = startPage; i <= endPage; i++) {
    let activeClass = "";
  if (i === currentPage) {
    activeClass = "active";
  }
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${activeClass}" value="${i}">${i}</button>
    `);
  }

  // add "previous" and "next" buttons as needed
  if (currentPage > 1) {
    $('#pagination').prepend(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">&laquo; Previous</button>
    `);
  }
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next &raquo;</button>
    `);
  }
};


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  console.log("selected_pokemons:", selected_pokemons.length);
  $('#pokeCards').empty();
  
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}

const numberOfPokemon = (v, totalPokemonCount) => {
  $("#pokeCardsHeader").empty();
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalPokemonCount);
  const currentPagePokemonCount = endIndex - startIndex;
  $("#pokeCardsHeader").append(`
    <h2>
      Showing ${currentPagePokemonCount} of ${totalPokemonCount} pokemons
    </h2>
  `);
};

const filterPokemons = async () => {
  console.log(pokemons);

  const checkedTypes = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map((input) => input.value);
  console.log(checkedTypes);

   let filteredPokemons = [...pokemons];
  
  if (!filteredPokemons[0].types) {
   
    for (let i = 0; i < filteredPokemons.length; i++) {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${filteredPokemons[i].name}`);
      filteredPokemons[i].types = res.data.types.map((type) => type.type.name);
    }
  }

  filteredPokemons = filteredPokemons.filter((pokemon) => {
    const pokemonTypes = pokemon.types;
    return checkedTypes.every((type) => pokemonTypes.includes(type));
  });
  console.log(filteredPokemons);

pokemons = filteredPokemons;
const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
currentPage = 1;


console.log(numPages);
  paginate(currentPage, PAGE_SIZE, pokemons);
  updatePaginationDiv(currentPage, numPages);
  numberOfPokemon(currentPage, pokemons.length);

};


const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;
  const typesResponse = await axios.get('https://pokeapi.co/api/v2/type');
  const types = typesResponse.data.results.map((type) => type.name);

  // add checkboxes for each type
  types.forEach((type) => {
  $('#filters').append(`
    <div class="form-check">
      <input class="form-check-input type-checkbox" type="checkbox" value="${type}" id="${type}">
      <label class="form-check-label" for="${type}">
        ${type}
      </label>
    </div>
  `);
});


  



  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages);
  numberOfPokemon(currentPage, pokemons.length);



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })


  const checkboxes = document.querySelectorAll('input[type=checkbox]');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', filterPokemons);
  });
  
 


  

}







$(document).ready(setup)