//-------------------Packages---------------------//
const express = require("express");
const fs = require("fs");
const app = express();
const pokemonroute = express.Router();
app.use("/pokemon", pokemonroute);
app.use(express.json());
//-----------------------------------------------//
function base64_encode(file) {
  var bitmap = fs.readFileSync(file);
  return new Buffer.from(bitmap).toString("base64");
}
//-----------------------------------------------//
const Pokemondata = JSON.parse(fs.readFileSync("./pokedex.json", "utf-8"));
//--------------MiddleWares---------------------//
const getpokemondata = (req, res) => {
  const name = req.params.pid;
  console.log(name);
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const Pokemon = Pokemondata.find(el => el.name.english === nameCapitalized);
  if (!Pokemon)
    return res
      .status(404)
      .json({ status: "failed", message: "Data not found" });
  var id = Pokemon.id;

  if (id < 10) id = "00" + id;
  else if (id < 100) id = "0" + id;
  console.log(id);
  res.status(200).json({
    status: "success",
    image: "http://www.serebii.net/pokemongo/pokemon/" + id,
    data: {
      Pokemon
    }
  });
};

//----------------------------------------------//
pokemonroute.route("/:pid").get(getpokemondata);
//-------------------Server---------------------//
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//-----------------------------------------------//
