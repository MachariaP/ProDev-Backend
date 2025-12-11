import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { ChamaGroup } from '../types/api';

interface GroupsContextType {
  groups: ChamaGroup[];
  setGroups: (groups: ChamaGroup[]) => void;
  refreshGroups: () => Promise<void>;
  getGroupById: (id: number) => ChamaGroup | undefined;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
};

interface GroupsProviderProps {
  children: ReactNode;
}

export const GroupsProvider: React.FC<GroupsProviderProps> = ({ children }) => {
  const [groups, setGroups] = useState<ChamaGroup[]>([]);

  const refreshGroups = async () => {
    return Promise.resolve();
  };

  const getGroupById = (id: number) => {
    return groups.find(group => group.id === id);
  };

  return (
    <GroupsContext.Provider value={{ groups, setGroups, refreshGroups, getGroupById }}>
      {children}
    </GroupsContext.Provider>
  );
};
