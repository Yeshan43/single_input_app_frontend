import NameForm from './components/NameForm.jsx'

function App() {
  return (
    <div className="page">
      <main className="panel" role="main">
        <p className="eyebrow">New record</p>
        <h1 className="title">Full Name Intake</h1>
        <p className="subtitle">
          Submit a name to the API. It will be stored in the backend
          database.
        </p>

        <NameForm />
      </main>

      <p className="footnote">React &rarr; Django REST API &rarr; SQL Server</p>
    </div>
  )
}

export default App
