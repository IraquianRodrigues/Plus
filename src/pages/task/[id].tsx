import { GetServerSideProps } from "next";
import Head from "next/head";
import styles from './styles.module.css'
import {db} from '../../services/firebaseConnection'
import {doc,
    collection,
    query,
    where,
    getDoc,
    addDoc,
    getDocs,
    deleteDoc
} from 'firebase/firestore'
import { createDecipheriv } from "crypto";
import {Textarea} from '../../components/textarea'
import {ChangeEvent, FormEvent, useState} from 'react'
import {useSession} from 'next-auth/react'
import { deepCopy } from "@firebase/util";
import {FaTrash} from 'react-icons/fa'


// criando a tipagem para task
interface TasksProps{
    item: {
        tarefa: string;
        user: string;
        public: boolean;
        created: string;
        taskId: string;
    };
    allComments: CommentsProps[]
}

interface CommentsProps{
    id:string,
    comment: string,
    taskId: string,
    user: string,
    name: string,       
}


export default function Task({item,allComments}: TasksProps){
    const {data: session} = useSession();
    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentsProps[]>(allComments || [])
    
    async function handleComment(event: FormEvent){
        event.preventDefault();
        
        if(input === "") return;

        if(!session?.user?.email || !session?.user?.name) return;

        try{
           
            // cadastrando no banco a coleção "comentarios" 
            const docRef = await addDoc(collection(db, "comments"), {
              comment: input,
              created: new Date(),
              user: session?.user?.email,
              name: session?.user?.name,
              taskId: item?.taskId, 
            });

            const data={
              id: docRef.id,
              comment: input,
              user: session?.user?.email,
              name: session?.user?.name,
              taskId: item?.taskId
            }

            setComments((oldItems) => [...oldItems, data])

            setInput("");
        
        }catch(err){
            console.log(err);
        }
      }
        // deletando comentario
        async function handleDeleteComment(id:string){
          try{
            const docRef = doc(db,'comments', id)
            await deleteDoc(docRef)
            const deleteComment = comments.filter((item) => item.id !== id)

            setComments(deleteComment)

          }catch(err){
            console.log(err)
          }
        }

    return(
      <div className={styles.container}>
       <Head>
        <title>Tarefa - Detalhes da tarefa</title>
       </Head>
    <main className={styles.main}>
          <h1>Tarefas</h1>
       <article className={styles.task}>
        <p>
         {item.tarefa}
        </p>
       </article>
     </main>
        
        <section className={styles.commentsContainer}>
        <h2>Deixar comentário</h2>
      
        <form onSubmit={handleComment}>
        <Textarea
        value={input}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
        placeholder="Digite o seu comentrio..."
        />

        <button disabled={!session?.user} className={styles.button}>Enviar comentário</button>
        </form>
        </section>

        <section className={styles.commentsContainer}>
          <h2>Todos os comentários</h2>
          {comments.length === 0 && (
            <span>Nenhum comentário encontrado...</span>
          )}
          
          {comments.map((item) =>(
            <article key={item.id} className={styles.comment}>
              <div className={styles.headComment}>
                <label className={styles.commentLabel}>{item.name}</label>
                 {item.user === session?.user?.email && (
                   <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                   <FaTrash
                   size={18} color="#EA3140"/>     
                 </button>
                 )}
              </div>
              <p>{item.comment}</p>
            </article>   
          ))}
        </section>
    </div>
  )
}

// serverside para buscar qual que é a tarefa ------
export const getServerSideProps: GetServerSideProps = async ({params}) =>{
    const id = params?.id as string; 
    const docRef = doc(db, "tasks", id)

    // acessando os comentarios das tarefas
    const q = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)

    let allComments: CommentsProps[] = [];
    snapshotComments.forEach((doc) =>{
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })
    
    console.log(allComments)
    
    const snapshot = await getDoc(docRef)

    // se não encontrar a tarefa, redirecionar para a home
    if(snapshot.data() === undefined){
        return{
        redirect:{
        destination: '/',
        permanent: false
        }
    }
}
    // se a tarefa não é publica, redirecionar a home
    if(!snapshot.data()?.public){
        return{
            redirect:{
            destination: '/',
            permanent: false
          }
    }
}
    // formartar tempo em data
    const mileseconds = snapshot.data()?.created?.seconds * 1000;
    const task={
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(mileseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    console.log(task)

    
    return{
    props: {
        item: task,
        allComments: allComments,
    }
  }   
}