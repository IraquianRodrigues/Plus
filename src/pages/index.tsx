import Head from 'next/head';
import { Inter } from '@next/font/google';
import styles from '../../styles/home.module.css';
import Image from 'next/image';
import heroImg from '../../public/assets/hero.png';
import { GetStaticProps } from 'next';
import {collection,getDocs} from 'firebase/firestore'
import {db} from '../services/firebaseConnection'

interface HomeProps{
  posts: number;
  comments: number;
}

export default function Home({posts,comments}: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefa+ | Organize suas tarefas de forma fácil</title>
      </Head>  
      <main className={styles.main}>
        <div className={styles.logoContent}>
        <Image
        className={styles.hero}
        alt= 'Logo Tarefas+'
        src={heroImg}
        priority
        />
        </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br/>
          seus estudos e tarefas
        </h1>   
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+ {posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+ {comments} comentários</span>
          </section>
        </div>
      </main>
      <footer className={styles.footer}>
        <span>Desenvolvido por Iraquian Rodrigues</span>
        <span> © Copyrigth 2023</span>
      </footer>
    </div>       
  );
}

export const getStaticProps: GetStaticProps = async () => {
    
  //buscar do banco os numero e mandar para o componente
  const commentRef = collection(db, "comments")
  const postRef = collection(db, "tasks")
  
  const commentSnapshot = await getDocs(commentRef)
  const postSnapshot = await getDocs(postRef)
  
  return{
    props:{
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60, // revalidade a cada 60 segundos
  }
}
