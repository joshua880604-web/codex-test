'use client';
import type {ReactNode,MouseEvent} from 'react';
import {flushSync} from 'react-dom';
import {openBlogSnippetKit} from '@/lib/blog-snippet-access';
export default function BlogSnippetLink({children,onBeforeOpen}:{children:ReactNode;onBeforeOpen?:()=>void}){
 function follow(event:MouseEvent<HTMLAnchorElement>){
  if(event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||!document.getElementById('blog-snippet-kit'))return;
  event.preventDefault();
  if(onBeforeOpen)flushSync(onBeforeOpen);
  // Leave #calc and edited form state intact; this is a reading shortcut.
  openBlogSnippetKit();
 }
 return <a href="#blog-snippet-kit" aria-controls="blog-snippet-kit" onClick={follow}>{children}</a>;
}
