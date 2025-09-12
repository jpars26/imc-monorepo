// apps/api/src/entidades/Usuario.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Avaliacao } from "./Avaliacao";
import { Cargo } from "@imc/shared"; // ✅ enum centralizado

@Entity("usuarios")
export class Usuario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  senhaHash!: string;

  // ✅ tipagem forte com o enum compartilhado, sem mudar o tipo físico no SQLite

  @Column({ type: "text" })
  cargo!: Cargo;

  @Column({ default: true })
  ativo!: boolean;

  @OneToMany(() => Avaliacao, (a) => a.aluno)
  avaliacoesComoAluno!: Avaliacao[];

  @OneToMany(() => Avaliacao, (a) => a.professor)
  avaliacoesComoProfessor!: Avaliacao[];

  @CreateDateColumn()
  criadoEm!: Date;

  @UpdateDateColumn()
  atualizadoEm!: Date;
}
