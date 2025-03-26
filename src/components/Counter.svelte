<script>
  let count= $state(0);
</script>

<h1>
  {count}
</h1>

<button onclick={() => count++}>+</button>
<button onclick={() => count--}>-</button>
