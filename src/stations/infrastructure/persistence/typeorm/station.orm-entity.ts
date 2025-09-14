import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  // store lowercase codes to ensure case-insensitive uniqueness
  @Index({ unique: true })
  @Column({ length: 50 })
  code: string;

  @Column({ length: 200 })
  name: string;
}
