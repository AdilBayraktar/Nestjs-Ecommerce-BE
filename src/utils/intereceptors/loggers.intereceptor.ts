// Manaual way to create a custom interceptor in NestJS

// import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
// import { map, Observable, tap } from 'rxjs';

// @Injectable()
// export class LoggersInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
//     console.log('Before handling the request');
//     return next.handle().pipe(
//       map((responseData) => {
//         const { password, ...rest } = responseData;
//         return { ...rest };
//       }),
//     );
//   }
// }
