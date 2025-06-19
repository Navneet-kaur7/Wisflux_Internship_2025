

import Header from './header';

import Footer from './footer';
import TodoApp from './TodoApp';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
     <main style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <TodoApp />
      </main>
      <Footer />
    </div>
  );
}

export default App;
