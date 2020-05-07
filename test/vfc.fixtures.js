function makeUsersArray() {
    return [
      {
        id: 1,
        username: 'test-user-1',
        password: 'password1!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 2,
        username: 'test-user-2',
        passw: 'password2!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 3,
        username: 'test-user-3',
        passw: 'password3!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
      {
        id: 4,
        username: 'test-user-4',
        passw: 'password4!',
        date_created: '2029-01-22T16:28:32.615Z',
      },
    ]
}
  
function makeCharactersArray() {
    return [
       
        {
            id: 1,
            auth: 'someauth1',
            username: 'test-user-1',
            user_id: 1,
            char_name: 'test-Char-1',
            strength: 4,
            intelligence: 2,
            charisma: 2,
            agility: 2,
            current_level: 0,
            current_points: 0,
            wins: 0,
            losses: 0,
            attrPoints: 0,
        },
        {
            id: 2,
            auth: 'someauth2',
            username: 'test-user-2',
            user_id: 2,
            char_name: 'test-Char-2',
            strength: 3,
            intelligence: 2,
            charisma: 3,
            agility: 2,
            current_level: 0,
            current_points: 0,
            wins: 0,
            losses: 0,
            attrPoints: 0,
        },
        {
            id: 3,
            auth: 'someauth3',
            username: 'test-user-3',
            user_id: 3,
            char_name: 'test-Char-3',
            strength: 2,
            intelligence: 4,
            charisma: 3,
            agility: 1,
            current_level: 0,
            current_points: 0,
            wins: 0,
            losses: 0,
            attrPoints: 0,
        },
        {
            id: 4,
            auth: 'someauth4',
            username: 'test-user-4',
            user_id: 4,
            char_name: 'test-Char-4',
            strength: 3,
            intelligence: 3,
            charisma: 3,
            agility: 1,
            current_level: 0,
            current_points: 0,
            wins: 0,
            losses: 0,
            attrPoints: 0,
        },
    ]
}

function makeMatchesArray() {
    return [
      {
        id: 1,
        char_1_id: 2,
        char_2_id: 1,
        winner: 'test-user-1',
        loser: 'test-user-2',
        points: 2
      },
      {
        id: 1,
        char_1_id: 2,
        char_2_id: 1,
        winner: 'test-user-1',
        loser: 'test-user-2',
        points: 2
      },
      {
        id: 1,
        char_1_id: 2,
        char_2_id: 1,
        winner: 'test-user-1',
        loser: 'test-user-2',
        points: 2
      },
      {
        id: 1,
        char_1_id: 2,
        char_2_id: 1,
        winner: 'test-user-1',
        loser: 'test-user-2',
        points: 2
      },
    ]
}

module.expport = {
    makeUsersArray,
    makeCharactersArray,
    makeMatchesArray
}