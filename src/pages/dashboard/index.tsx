import { GetServerSideProps } from 'next'
import styles from './styles.module.css'
import Head from 'next/head'
import {getSession} from 'next-auth/react'
import {Textarea} from '../../components/textarea'
import {FiShare2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'
import {ChangeEvent, FormEvent, useState, useEffect} from 'react'
import {db} from '../../services/firebaseConnection'
import {addDoc, collection,query,orderBy,where,onSnapshot,doc, deleteDoc} from 'firebase/firestore'
import { async } from '@firebase/util'
import Link from 'next/link'


// criando uma interface
interface HomeProps{
  user:{
    email:string
  }
}
// criando a propriedade tasksprops
interface TasksProps{
  id: string
  created: Date
  public: boolean
  tarefa: string
  user: string
}

export default function Dashboard({user}: HomeProps){

  const [input, setInput] = useState("")
  const [publicTask, setPublicTask] = useState(false)
  const [ tasks, setTasks] = useState <TasksProps[]>([])

  useEffect(() =>{
    async function loadTarefas(){

      // buscando as tarefas para exibir na tela
      const tarefasRef = collection(db,"tasks")
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      )
        onSnapshot(q,(snapshot) =>{
          let lista = [] as TasksProps[]

          snapshot.forEach((doc) =>{
            lista.push({
              id: doc.id,
              tarefa: doc.data().tarefa,
              created: doc.data(). created,
              user: doc.data().user,
              public: doc.data().public
            })
          })
            setTasks(lista);
        })
    }

    loadTarefas();
  }, [user?.email])


  // criando a função pra saber se o checkbox está true ou false
  function handleChangePublic(event: ChangeEvent <HTMLInputElement>){
    setPublicTask(event.target.checked)
  }

  // criando a função de registrar TAREFA!
  async function handleRegisterTask(event: FormEvent){
    event.preventDefault();

    if(input === "") return;

    try{
      await addDoc(collection(db, "tasks"), {
        tarefa: input,
        created: new Date(),
        user:user?.email,
        public: publicTask,
      });

      setInput("")
      setPublicTask(false);
    } catch(err){
      console.log(err);
    }
  }

  // criando função de compartilhar(share)
  async function handleShare(id:string){
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );
  }

  // função deletar tarefa
  async function handledeleteTask(id: string){
    const docRef = doc(db, "tasks", id)
    await deleteDoc(docRef)
  }


return(
   <div className={styles.container}>
    <Head>
         <title>Meu painel de tarefas</title>
    </Head>
            
     <main className={styles.main}>
        <section className={styles.content}>
           <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual a sua tarefa?</h1>
                
                <form onSubmit={handleRegisterTask}>            
                  <Textarea
                  placeholder='Digite a sua tarefa...'
                  value={input}
                  onChange={(event:ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                  />  
                  <div className={styles.checkboxArea}>
                    <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={publicTask}
                    onChange={handleChangePublic}
                    />
                    <label>Deixar tarefa publica?</label>
                  </div>
                  <button className={styles.button} type='submit'>
                    Registrar
                  </button>
                </form>
           
           </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          
        {tasks.map((item) =>(
              <article key={item.id} className={styles.task}>
              {item.public && (
                  <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICO</label>
                  <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                    <FiShare2
                    size={22}
                    color='#3183ff'       
                    />
                  </button>
                </div>
              )}
   
              <div className={styles.taskContent}>
                {item.public?(
                  <Link href={`/task/${item.id}`}>
                  <p>{item.tarefa}</p>
                  </Link>
                ): (
                  <p>{item.tarefa}</p>
                )}
                <button className={styles.trashButton} onClick={() => handledeleteTask(item.id)}>
                  <FaTrash
                  size={24}
                  color='#ea3140'
                  />
                </button>
              </div>
            </article>  
        ))}          
        </section>
     </main>
    </div>
  )
}
 
// ---- CRIANDO A FUNÇÃO DE PRE-RENDERIZAR UMA PAGINA CUJO OS DADOS DEVEM SER BUSCADO NO MOMENTO DA SOLICITAÇÃO! ------
export const getServerSideProps: GetServerSideProps = async({req}) =>{
   const session = await getSession({req})
   console.log(session)

    if(!session?.user){
        // se não tem usuario, vamos redirecionar para home
        return{
            redirect:{
                destination: '/',
                permanent: false
            }
        }
    }

  return{
     props: {
       user: {
       email: session?.user?.email,
      },
    },
  };
};