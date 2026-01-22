import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 1.5rem 1rem;
  border-radius: 10px;
  background-color: #406161;
`;

export const HeaderWrapper = styled.header`
  display: flex;
  align-items: center;
  gap: 2rem;

  .header__img {
    cursor: pointer;
  }
`;

export const Questions = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 1.5rem;
  background-color: #b4ae5c;
  color: #282828;
  font-weight: bold;
  position: absolute;
  opacity: 0;
  left: 20rem;

  span {
    font-size: 1.1rem;
    text-align: left;
    color: #040404;
    margin-bottom: .5rem;
  }

  .question {
    p {
      margin: .1rem;
      text-align: left;
      font-size: .8rem;
    }
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-bottom: 20px;

  .header__img {
    width: 5rem;
    height: 5rem;
    padding: 20px;
    border-radius: 50%;
    background-color: #242424;
    //border: 4px solid #558243;
  }
`;

export const Chat = styled.section`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 45rem;
  height: auto;
  background-color: #131313;
  border-radius: 10px;
  padding: 2rem 2rem;
  position: relative;

  .icon-m {
    color: #605f36;
    font-size: 24px;
    position: absolute;
    top: .5rem;
    right: .5rem;
    cursor: pointer;

    &:hover {
      color: #aaa961;
    }
  }

  .chat__messages {
    display: flex;
    flex-direction: column;
    padding: 0rem;
    height: 30rem;
    border-radius: 0.8rem;
    overflow-y: auto;
  }

  .chat__message {
    display: flex;
    gap: 10px;
    border-radius: 10px;
    background-color: #131313;
    max-width: 80%rem;
  }

  .chat__user {
    align-self: flex-end;
    padding: 0.8rem 1.5rem;
    max-width: 20rem;
    text-align: left;
  }

  .chat__ai {
    align-self: flex-start;
    text-align: left;
    padding: 0.8rem 1.5rem;
    max-width: 20rem;
  }

  .chat__phrase {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    span {
      border: 1px solid #aaa961;
      padding: 1rem;
      border-radius: 1rem;
    }

    .icon {
      flex-shrink: 0;
    }
  }

  .chat__input-group {
    display: flex;
    gap: 10px;
  }

  .chat__input {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ccc;
  }

  button {
    padding: 10px 20px;
    border-radius: 10px;
    background-color: #406161;
    color: #fff;
    cursor: pointer;
  }
`;
