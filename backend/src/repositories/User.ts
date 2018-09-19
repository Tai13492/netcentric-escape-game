import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import Player from "../dataModel/player.model";
import { Crypto } from "./crypto";
import { IFullToken, JWTAuth } from "./JWTAuth";
import { partialOf } from "./util/ObjectMapper";

export class User {

    public static getInstance(): User {
        if (!this.instance) {
            this.instance = new User();
        }
        return this.instance;
    }
    private static instance: User;

    private constructor() { }

    public addUser(
        nickname: string,
        email: string,
        password: string,
    ): Observable<Player> {
        const player = new Player({
            email, nickname, password: Crypto.encrypt(password),
        });
        return from(player.save());
    }

    public deleteUser(
        email: string,
    ): Observable<number> {
        return from(Player.destroy({ where: { email } }));
    }

    public edit(
        email: string,
        value: Partial<Player>,
    ): Observable<number> {
        return from(Player.update(partialOf<Player>(value), { where: { email } })).pipe(
            map((result) => result[0]),
        );
    }

    public login(
        email: string,
        password: string,
    ): Observable<IFullToken> {
        return from(Player.findOne({ where: { email } })).pipe(
            map((player) => {
                if (player) {
                    if (Crypto.equals(player.password, password)) {
                        return JWTAuth.getAllToken(email);
                    } else {
                        throw new Error("Email and password does not match");
                    }
                } else {
                    throw new Error(`Cannot find user with email: ${email}`);
                }
            }),
        );
    }
}
