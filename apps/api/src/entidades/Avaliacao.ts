// apps/api/src/entidades/Avaliacao.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { Usuario } from "./Usuario";

@Entity("avaliacoes")
export class Avaliacao {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // índice para consultas por aluno
  @Index("IDX_avaliacoes_aluno")
  @ManyToOne(() => Usuario, (u) => u.avaliacoesComoAluno, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "alunoId" })
  aluno!: Usuario;

  // índice para consultas por professor
  @Index("IDX_avaliacoes_professor")
  @ManyToOne(() => Usuario, (u) => u.avaliacoesComoProfessor, {
    onDelete: "RESTRICT",
    nullable: false,
  })
  @JoinColumn({ name: "professorId" })
  professor!: Usuario;

  @Column("real")
  alturaM!: number;

  @Column("real")
  pesoKg!: number;

  @Column("real")
  imc!: number;

  @Column("text")
  classificacao!: string;

  @CreateDateColumn({ name: "avaliadoEm" })
  avaliadoEm!: Date;
}
