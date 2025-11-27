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
      <Card name="Yves" email="Hdmi@gmail.com" phone='06 37 43 84 98'/> 
    </div>
    </>
  );
}

export default App;
