import React, { useEffect, useState } from "react";
import './App.css';

import Navbar from "./Components/Navbar/Navbar";
import Board from "./Components/Board/Board";
import axios from "axios"; 

function App() {
  const defaultGroupBy = localStorage.getItem('groupBy') || "status";
  const defaultSortBy = localStorage.getItem('sortBy') || "priority";

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupBy, setGroupBy] = useState(defaultGroupBy);
  const [sortBy, setSortBy] = useState(defaultSortBy);

  const priorityLevels = {
    0: (
      <div className="user-label">
        <img src="https://cdn-icons-png.flaticon.com/128/9974/9974563.png" className='user-pic' alt="No Priority" /> No Priority
      </div>
    ),
    2: (
      <div className="user-label">
        <img src={process.env.PUBLIC_URL + "/l.jpg"} className='user-pic' alt="Low" /> Low
      </div>
    ),
    3: (
      <div className="user-label">
        <img src={process.env.PUBLIC_URL + "/m.jpg"} className='user-pic' alt="Medium" /> Medium
      </div>
    ),
    4: (
      <div className="user-label">
        <img src={process.env.PUBLIC_URL + "/h.jpg"} className='user-pic' alt="High" /> High
      </div>
    ),
    1: (
      <div className="user-label">
        <img src="https://cdn-icons-png.flaticon.com/128/6324/6324052.png" className='user-pic' alt="Urgent" /> Urgent
      </div>
    )
  };

  const userMappings = users.reduce((acc, user) => {
    const [firstName, lastName = ''] = user.name.split(' ');
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const color = generateRandomColor();

    acc[user.id] = (
      <div className="user-label">
        <div
          className="user-pic"
          style={{
            backgroundColor: color,
          }}
        >
          {firstInitial}
          {lastName && ` ${lastInitial}`}
        </div>
        {user.name}
      </div>
    );
    return acc;
  }, {});

  function generateRandomColor() {
    const hexChars = '01234567';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return color;
  }

  useEffect(() => {
    fetchDetails();
  }, []);

  useEffect(() => {
    localStorage.setItem('groupBy', groupBy);
    localStorage.setItem('sortBy', sortBy);
  }, [groupBy, sortBy]);

  async function fetchDetails() {
    try {
      const { data } = await axios.get("https://api.quicksell.co/v1/internal/frontend-assignment");
      const updatedTickets = data.tickets.map(ticket => {
        switch (ticket.priority) {
          case 1:
            ticket.priority = 2;
            break;
          case 2:
            ticket.priority = 3;
            break;
          case 3:
            ticket.priority = 4;
            break;
          case 4:
            ticket.priority = 1;
            break;
          default:
            break;
        }
        return ticket;
      });
      setTickets(updatedTickets); 
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const groupTickets = () => {
    const organized = {};
  
    if (groupBy === 'status') {
      const statusGroups = {
        "Backlog": [],
        "Todo": [],
        "In progress": [],
        "Done": [],
        "Cancelled": []
      };
  
      tickets.forEach(ticket => {
        if (statusGroups[ticket.status]) {
          statusGroups[ticket.status].push(ticket);
        }
      });
  
      return statusGroups;
    } else if (groupBy === 'priority') {
      const priorityGroups = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: []
      };
  
      tickets.forEach(ticket => {
        if (priorityGroups[ticket.priority]) {
          priorityGroups[ticket.priority].push(ticket);
        }
      });
  
      return priorityGroups;
    } else if (groupBy === 'user') {
      const userGroups = {
        "usr-1": [],
        "usr-2": [],
        "usr-3": [],
        "usr-4": [],
        "usr-5": []
      };
  
      tickets.forEach(ticket => {
        if (userGroups[ticket.userId]) {
          userGroups[ticket.userId].push(ticket);
        }
      });
  
      return userGroups;
    } 
  
    return organized;
  };

  const sortTicketsByPriority = (tickets) => {
    return [...tickets].sort((a, b) => b.priority - a.priority);
  };

  const sortTicketsByTitle = (tickets) => {
    return [...tickets].sort((a, b) => a.title.localeCompare(b.title));
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleGroupByChange = (event) => {
    setGroupBy(event.target.value);
  };

  const getSortedTickets = (tickets) => {
    const sortFunctions = {
      priority: sortTicketsByPriority,
      title: sortTicketsByTitle,
    };
  
    return sortFunctions[sortBy] ? sortFunctions[sortBy](tickets) : tickets;
  };

  const groupedBoards = groupTickets();

  return (
    <div className="app-container">
      <div className="app-navbar">
        <nav>
          <Navbar
            sortingOption={sortBy}
            onSortingChange={handleSortByChange}
            groupingOption={groupBy}
            onGroupingChange={handleGroupByChange}
          />
        </nav>
      </div>
      <div className="app-outer-container">
        <div className="app-boards">
          {Object.keys(groupedBoards).map(boardKey => (
            <Board 
              key={boardKey} 
              title={groupBy === 'priority' ? priorityLevels[boardKey] : 
                     groupBy === 'user' ? userMappings[boardKey] : boardKey}
              count={groupedBoards[boardKey].length}
              tickets={getSortedTickets(groupedBoards[boardKey])}
              sortingOption={sortBy}
              groupingOption={groupBy} 
              users={users}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
