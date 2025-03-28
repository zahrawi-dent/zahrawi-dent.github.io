import { createEffect, createSignal, Show } from "solid-js";
import '../styles/markdown.css'

const [theme,setTheme] = createSignal("dark")

export default function ExpSolid() {
  const [count, setcount] = createSignal(0);
  const [double, setdouble] = createSignal(0);
  createEffect(() => {
    setdouble(count() * 2);
    console.log(double(), "changed");
  });
  return (
    <div
      classList={{ 'bg-white': theme() === 'light', 'bg-black': theme() === 'dark' }}
    >
      <h1 onclick={() => setcount(count() + 1)}>Experiencia</h1>

      <Show when={count() > 5}
      fallback={
        <h2 >HELLLO Im less than 5: {count()}</h2>
      }
      >
        <h2>HELLLO Im more than 5: {count()}</h2>
      </Show>

      <SubExp count={count()} />
    </div>
  );
}

interface SubProps {
  count: number;
}

function SubExp(props: SubProps) {
  return (
    <div>
      <h1>{props.count}</h1>
      <button onclick={() => setTheme(theme() === 'light'?'dark':'light')}>Change Theme</button>
    </div>
  );
}
