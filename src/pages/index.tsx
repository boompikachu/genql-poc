import { Inter } from "next/font/google";
import {
  OperationContext,
  RequestPolicy,
  cacheExchange,
  fetchExchange,
  useQuery,
} from "urql";
import Image from "next/image";

import {
  QueryGenqlSelection,
  QueryResult,
  generateQueryOp,
} from "../../generated/";
import { useState } from "react";

import { withUrqlClient } from "next-urql";

const inter = Inter({ subsets: ["latin"] });

export function useTypedQuery<Query extends QueryGenqlSelection>(opts: {
  query: Query & { __name?: string };
  pause?: boolean;
  requestPolicy?: RequestPolicy;
  context?: Partial<OperationContext>;
}) {
  const { query, variables } = generateQueryOp(opts.query);
  return useQuery<QueryResult<Query>>({
    ...opts,
    query,
    variables,
  });
}

function Home() {
  const [pokedexEntry, setPokedexEntry] = useState(0);
  const [input, setInput] = useState("0");

  const [pokemon] = useTypedQuery({
    query: {
      getPokemonByDexNumber: {
        __args: { number: pokedexEntry },
        color: true,
        sprite: true,
        species: true,
        types: { name: true },
      },
    },
  });

  const updatePokedexEntry = (newPokdexEntry: number) => {
    if (newPokdexEntry > 0) {
      setPokedexEntry(newPokdexEntry);
    }
  };

  const pokemonSprite = pokemon.data?.getPokemonByDexNumber.sprite;

  return (
    <main className={`p-2 flex flex-col items-center gap-y-4 ${inter}`}>
      <h1 className="text-2xl font-bold">Pokedex</h1>
      <div className="flex gap-x-2">
        <input
          type="text"
          className="border"
          value={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updatePokedexEntry(parseInt(input));
            }
          }}
          onChange={(e) => {
            const value = e.currentTarget.value;
            if (/^[0-9]{0,4}$/.test(value)) {
              setInput(value);
            }
          }}
        />
        <button
          onClick={() => {
            updatePokedexEntry(parseInt(input));
          }}
        >
          Search
        </button>
      </div>

      {pokemonSprite && (
        <Image
          src={pokemonSprite}
          alt=""
          width={100}
          height={100}
          className="w-[100px] h-[100px] object-contain"
        />
      )}
      <div>{pokemon.data?.getPokemonByDexNumber.species}</div>
      <div>
        {pokemon.data?.getPokemonByDexNumber.types
          .map((type) => type.name)
          .join(", ")}
      </div>
    </main>
  );
}

export default withUrqlClient((ssrExchange) => ({
  url: "https://graphqlpokemon.favware.tech/v7",
  exchanges: [cacheExchange, ssrExchange, fetchExchange],
}))(Home);
