// // src/app/api/customer/[id]/route.ts
// import { NextResponse } from 'next/server';
// import { getCustomerFormById } from '../../../../lib/supabase/index'; // Ou o caminho correto para sua função

// // Handler para requisições GET (buscar dados do formulário)
// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   // getCustomerFormById já faz a checagem de autenticação interna,
//   // mas você pode adicionar uma aqui também para uma camada extra.
//   // const supabase = createSupabaseServerClient();
//   // const { data: { user }, error: userError } = await supabase.auth.getUser();
//   // if (userError || !user) {
//   //   return NextResponse.json({ error: 'Não autorizado' }, { status: 401});
//   // }

//   const { data, error } = await getCustomerFormById(id);

//   if (error) {
//     if (error.message === "Usuário não autenticado.") {
//       return NextResponse.json({ error: "Sua sessão expirou ou você não está autenticado." }, { status: 401 });
//     }
//     console.error("Erro na API ao buscar dados do cliente:", error);
//     return NextResponse.json({ error: error.message || 'Falha ao buscar dados do cliente' }, { status: 500 });
//   }

//   if (!data) {
//     return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
//   }

//   return NextResponse.json(data);
// }

// // Opcional: Handler para requisições PUT (atualizar dados do formulário)
// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;
//   const formData = await request.json();

//   // Exemplo: Chamar uma função de atualização que usa createSupabaseServerClient()
//   // Importe sua função de atualização aqui (ex: updateCustomerForm)
//   // const { error } = await updateCustomerForm(id, formData);
//   // if (error) {
//   //   return NextResponse.json({ error: error.message || 'Falha ao atualizar formulário' }, { status: 500});
//   // }
//   // return NextResponse.json({ message: 'Formulário atualizado com sucesso' });

//   // Placeholder para PUT
//   console.log(`Recebido PUT para ID ${id} com dados:`, formData);
//   return NextResponse.json({ message: 'Atualização simulada com sucesso' });
// }

// // Opcional: Handler para requisições POST (criar novo formulário)
// // src/app/api/customer/route.ts (se for uma rota separada para criar)
// // export async function POST(request: Request) {
// //   const formData = await request.json();
// //   // ... lógica para criar novo formulário usando createSupabaseServerClient()
// //   return NextResponse.json({ message: 'Formulário criado com sucesso' });
// // }