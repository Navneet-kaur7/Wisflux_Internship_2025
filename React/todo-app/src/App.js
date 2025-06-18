
import './App.css';
import Header from './header';

import Footer from './footer';


function App() {
  return (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {/* your page content */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
