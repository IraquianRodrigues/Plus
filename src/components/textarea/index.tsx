import styles from './styles.module.css';
import {HTMLProps} from 'react';

// criando um componente dinamico para cada estado!
export function Textarea({...rest}: HTMLProps<HTMLTextAreaElement>){
    return <textarea className={styles.textarea} {...rest}></textarea>;
}