//-------------------Packages---------------------//
const express = require("express");
const fs = require("fs");
const app = express();
const cors = require('cors')
const pokemonroute = express.Router();
app.use("/pokemon", pokemonroute);
app.use(express.json());
app.use(cors())
pokemonroute.use(cors());
pokemonroute.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://kriticalflarepokedex.netlify.com/');
  res.header('Access-Control-Allow-Credentials','omit');
  next();
});
//-----------------------------------------------//
function findid(id) {
  if (id < 10) return "00" + id;
  else if (id < 100) return "0" + id;
  else return id;
}
//-----------------------------------------------//
const Pokemondata = JSON.parse(fs.readFileSync("./pokedex.json", "utf-8"));
//--------------MiddleWares---------------------//
const getpokemondata = (req, res) => {
  const name = req.params.pid;
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  var TempPokemon = Pokemondata.filter(el => el.name.english.substring(0,nameCapitalized.length) === nameCapitalized);
  if (TempPokemon.length === 0)
    return res
      .status(404)
      .json({ status: "failed", message: "Data not found" });

 
  var pokemon = [] ;
Object.keys(TempPokemon).forEach(function (key) {
    var value = TempPokemon[key].value;

    if(value >= 10 && value <= 20) {
        TempPokemon[key].value = 7;
    } else if(value > 20 && value <= 40) {
        TempPokemon[key].value = 8;
    }
    var id = findid(TempPokemon[key].id);

    TempPokemon[key] = {
      ...TempPokemon[key],
      image: "http://www.serebii.net/pokemongo/pokemon/" + id + ".png"
    };
    pokemon.push(TempPokemon[key]);
});
  res.status(200).json({
    status: "success",
    data: {
      pokemon
    }
  });
};
const pokemonrandomizer = (req, res) => {
  var pokemon = [];
  for (let i = 0; i < 6; i += 1) {
    var temppokemon = Pokemondata[Math.floor(Math.random() * 809)];
    var id = findid(temppokemon.id);
    temppokemon = {
      ...temppokemon,
      image: "http://www.serebii.net/pokemongo/pokemon/" + id + ".png"
    };
    pokemon.push(temppokemon);
  }
  return pokemon;
};
const home = (req, res) => {
  const pokemon = pokemonrandomizer();
  res.status(200).json({
    status: "success",
    data: {
      pokemon
    }
  });
};
//----------------------------------------------//
pokemonroute.route("/random").get(home);
pokemonroute.route("/:pid").get(getpokemondata);
// pokemonroute.route("/$sort").get(getpokemondata);
// pokemonroute.route("/$type").get(getpokemondata);

//-------------------Server---------------------//
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//-----------------------------------------------//
