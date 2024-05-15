import { Injectable } from '@angular/core';
import { User, createClient } from '@supabase/supabase-js'

const supabase = createClient('https://pyspvbywwfcxmsldxrvl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5c3B2Ynl3d2ZjeG1zbGR4cnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUyMTI2NzQsImV4cCI6MjAzMDc4ODY3NH0.nipdrlpnfvqZ1OcCU5GDkjZha-v88W5_nd2WsvHnxpw');

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  constructor() { }

  //User
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

  async signup(email: string, password: string) {
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


  //Avatar
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

  async getAllAvatars(pageData: PageData, filters: Filter[]): Promise<{ avatars: any[], count: number }> {
    return new Promise<any>(async (resolve, reject) => {
      let query = supabase.from('v_all_avatars').select('*', { count: 'exact' });
      
      for (const filter of filters) {
        query = query.eq(filter.field, filter.value);
      }

      if(pageData) {
        console.log(pageData.pageIndex * pageData.pageSize, (pageData.pageIndex * pageData.pageSize) + pageData.pageSize - 1);
        query = query.limit(pageData.pageSize)
        .range(pageData.pageIndex * pageData.pageSize, (pageData.pageIndex * pageData.pageSize) + pageData.pageSize - 1);}
      
      const { data, error, count } = await query;

      if (data) {
        for (const avatar of data) {
          avatar.images = await this.getAvatarImages(avatar.id);
        }
      }

      const response = {
        avatars: data || [],
        count: count || 0
      }

      if (error) {
        reject(error);
      } else {
        console.log(response);
        resolve(response);
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

  async downloadAvatar(id: number, name: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const { data } = await supabase.storage
        .from('avatar_images')
        .getPublicUrl(`${id}/config/${name.slice(0,15)}.chf`);

      
      if(data) resolve(data.publicUrl);
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

  async uploadAvatarConfig(file: File, avatarId: number, name:string): Promise<string> {
    return new Promise<any>(async (resolve, reject) => {
      const { data, error } = await supabase.storage
        .from('avatar_images')
        .upload(`${avatarId}/config/${name.slice(0,15)}.chf`, file);

      if (error) {
        reject(error);
      } else {
        resolve(data);
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

  //Game Versions
  async getGameVersions(): Promise<Array<string>> {
    return new Promise<Array<string>>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('game_versions')
        .select('version');

      if (error) {
        reject(error);
      } else {
        resolve(data.map(v => v.version) || []);
      }
    });
  }

  //Vote
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

  //Star
  async starAvatar(avatarId: number, userId: string) {
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('stars')
        .upsert({ avatar_id: avatarId, user_id: userId })
        .select();

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }

  async removeStarAvatar(avatarId: number, userId: string) {
    return new Promise<void>(async (resolve, reject) => {
      const { data, error } = await supabase
        .from('stars')
        .delete()
        .eq('avatar_id', avatarId)
        .eq('user_id', userId);

      if (error) {
        reject(error);
      } else {
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
  score: number;
  game_version: string;
  user_vote?: boolean;
  user_star?: boolean;
}

export interface Filter {
  field: string;
  value: string;
}

export interface PageData {
  pageSize: number;
  pageIndex: number;
}