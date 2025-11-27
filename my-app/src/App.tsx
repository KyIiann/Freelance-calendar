import Card from '../components/ui/card.tsx'
import Button from '../components/ui/button.tsx'
import './App.css'

function App() {
  return (
    <>
    <div>
      <h1>Hello World</h1>
      <Button>children</Button>
      <Button>Parent</Button>
    </div>
    <div>
      <Card name="Kyliann Tonolo" email="Kyliann@gmail.com" phone='07 68 77 84 86'/> 
    </div>
    </>
  );
}

export default App;
