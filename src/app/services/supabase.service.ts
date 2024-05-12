import { Injectable } from '@angular/core';
import { User, createClient } from '@supabase/supabase-js'

const supabase = createClient('https://pyspvbywwfcxmsldxrvl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5c3B2Ynl3d2ZjeG1zbGR4cnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMTI2NzQsImV4cCI6MjAzMDc4ODY3NH0.nipdrlpnfvqZ1OcCU5GDkjZha-v88W5_nd2WsvHnxpw');

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  constructor() { }

  async login(email: string, password: string) {
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) reject(error);
      if (data) resolve();
    });
  }
  async logout () {
    return new Promise<void>(async (resolve, reject) => {
      const { error } = await supabase.auth.signOut();
      if (error) reject(error);
      else resolve();
    });
  }

  async signup(name: string, email: string, password: string) {
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) reject(error);
      if (data) resolve();
    });
  }

  async getLoggedInUser() {
    return new Promise<User | null>(async (resolve, reject) => {
      const { data } = await supabase.auth.getUser();
      resolve(data?.user ?? null);
    });
  }

  async createAvatar(name:string, gameVersion: string){
    return new Promise<number>(async (resolve, reject) => {
      const currentUser = await this.getLoggedInUser();

      if (!currentUser) {
        reject('Not logged in');
        return;
      }

      const { data, error } = await supabase
        .from('avatars')
        .insert({ name: name, game_version: gameVersion })
        .select();

      if (error) reject(error);
      if(data) resolve(data[0].id);
    });
  }

  async getAllAvatars(orderBy:string = '', ascending:boolean = false) {
    return new Promise<Array<Avatar>>(async (resolve, reject) => {
      let query = supabase.from('v_all_avatars').select();
      if (orderBy) {
        query = query.order(orderBy, { ascending: ascending });
      }
      const { data, error } = await query;

      if (data) {
        for (const avatar of data) {
          avatar.images = await this.getAvatarImages(avatar.id);
        }
      }

      if (error) {
        reject(error);
      } else {
        resolve(data || []);
      }
    });
  }

  async getAvatar(id: number) {
    return new Promise<Avatar>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('v_all_avatars')
        .select()
        .eq('id', id);

      if (data) {
        for (const avatar of data) {
          avatar.images = await this.getAvatarImages(id);
        }
      }

      if (error) {
        reject(error);
      } else {
        resolve(data[0]);
      }
    });
  }

  async getAvatarImages(avatarId: number): Promise<Array<String>> {
    const avatarImages: String[] = [];
    return new Promise<Array<String>>(async (resolve, reject) => {
      const { data, error } = await supabase
      .storage
      .from('avatar_images')
      .list(`${avatarId}/images`, {
        limit: 10,
        offset: 0,
        sortBy: { column: 'created_at', order: 'asc' },
      });

      if (error) {
        console.log(error);
      } else if(data) {
        for(let image of data){
          const { data } = supabase
            .storage
            .from('avatar_images')
            .getPublicUrl(`${avatarId}/images/${image.name}`);
          avatarImages.push(data.publicUrl);
        }
        resolve(avatarImages);
      }
    });
  }

  async updateAvatar(id: string, name: string, exportId: string) {
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('avatars')
        .update({ name, export_id: exportId })
        .eq('id', id);

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }

  async uploadAvatarImage(file: File, avatarId: number, name:string): Promise<string> {
    return new Promise<any>(async (resolve, reject) => {
      const { data, error } = await supabase.storage
        .from('avatar_images')
        .upload(`${avatarId}/images/${name}`, file);

      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  }

  async uploadAvatarConfig(file: File, avatarId: number): Promise<string> {
    return new Promise<any>(async (resolve, reject) => {
      const { data, error } = await supabase.storage
        .from('avatar_images')
        .upload(`${avatarId}/config/${file.name}`, file);

      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  }

  async avatarVote(avatarId: number, userId: string, vote: boolean) {
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('votes')
        .upsert({ avatar_id: avatarId, user_id: userId, vote_type: vote })
        .select();

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }

  async deleteAvatar(id: number){
    return new Promise<void>(async (resolve, reject) => {
      const currentUser = await this.getLoggedInUser();
      if (!currentUser) {
        reject('Not logged in');
        return;
      }

      const { data, error } = await supabase
        .from('avatars')
        .delete()
        .eq('id', id);

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }

  async removeVote(avatarId: number, userId: string) {
    console.log(avatarId, userId);
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('votes')
        .delete()
        .eq('avatar_id', avatarId)
        .eq('user_id', userId);

      if (error) {
        reject(error);
      } else {
        console.log(data);
        resolve();
      }
    });
  }
}



export interface Avatar {
  id: number;
  name: string;
  owner: string;
  images: string[];
  export_id: string;
  upvotes: number;
  downvotes: number;
  gameVersion: string;
  uservote?: boolean;
}