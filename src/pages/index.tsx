import { Inter } from "next/font/google";

import {
  createClient,
  enumPokemonEnum,
  generateQueryOp,
} from "../../generated/";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

// const client = createClient({
//   url: "<http://your-api>",
//   headers: {
//     Authorization: "Bearer xxx",
//   },
// });

// await client.query({
//   repository: { __args: { name: "genql", owner: "remorses" }, name: true },
// });

export default function Home() {
  const [pokedexEntry, setPokedexEntry] = useState(0);
  const [pokdexEntryInput, setPokdexEntryInput] = useState("0");

  const [name, setName] = useState("");

  const updatePokedexEntry = (newPokdexEntry: number) => {
    if (newPokdexEntry > 0) {
      setPokedexEntry(newPokdexEntry);
    }
  };

  useEffect(() => {
    const asdf = generateQueryOp({
      getPokemonByDexNumber: {
        __args: { number: pokedexEntry },
        color: true,
        species: true,
      },
    });
    fetch("https://graphqlpokemon.favware.tech/v7", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: asdf.query,
        variables: asdf.variables,
      }),
    })
      .then((e) => {
        return e.text();
      })
      .then((res) => {
        setName(res);
      });
  }, [pokedexEntry]);

  return (
    <main className={`p-2 flex flex-col items-center gap-y-4 ${inter}`}>
      <h1 className="text-2xl font-bold">Pokedex</h1>
      <div className="flex gap-x-2">
        <input
          type="text"
          className="border"
          value={pokdexEntryInput}
          onChange={(e) => {
            const value = e.currentTarget.value;
            if (/^[0-9]{0,4}$/.test(value)) {
              setPokdexEntryInput(value);
            }
          }}
        />
        <button
          onClick={() => {
            updatePokedexEntry(parseInt(pokdexEntryInput));
          }}
        >
          Search
        </button>
      </div>

      <div>{name}</div>
    </main>
  );
}
