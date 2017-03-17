/**************************************************************************
 *                      DO NOT MODIFY ANYTHING HERE                       *
 *  THIS FILE WILL BE REPLACED BY THE CORRESPONDING ENV FILE AT RUN TIME  *
 *         do env modifications @ ./environment.(dev/prod).ts             *
 *                                                                        *
 *     YOU NEED TO KEEP THE SAME STRUCTURE ACROSS ALL THE ENV FILES       *
 *   import this file in any of your components to access env variables   *
 **************************************************************************/

export const environment: any = {
    production: true,
    debug: true,

    service: {
        aglIdentityPort: '1212',
        afmMainPort: '5000',
        ip: '172.17.1.57',
        api_url: '/api'
    },
    session: {
        initial: ' ',
        timeout: 60,
        pingrate: 0
    },
    maxConnectionRetry: 10,
};