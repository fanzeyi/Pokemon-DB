//-------------------Packages---------------------//
const express = require("express");
const fs = require("fs");
const app = express();
const cors = require('cors')
const pokemonroute = express.Router();
app.use("/pokemon", pokemonroute);
app.use(express.json());
app.use(cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
//-----------------------------------------------//
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
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

  console.log(name);
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  var TempPokemon = Pokemondata.find(el => el.name.english === nameCapitalized);

  if (!TempPokemon)
    return res
      .status(404)
      .json({ status: "failed", message: "Data not found" });

  var id = findid(TempPokemon.id);
  console.log(id);
  TempPokemon = {
    ...TempPokemon,
    image: "http://www.serebii.net/pokemongo/pokemon/" + id + ".png"
  };
  var pokemon = [];
  pokemon.push(TempPokemon);

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
